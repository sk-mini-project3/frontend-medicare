"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  User,
  Calendar,
  Phone,
  FileText,
  TestTube,
  Clipboard,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { cn, isMeaningfulPatientGender } from "@/lib/utils"
import { PatientService } from "@/services/patient.service"
import type { PatientDetailsDto } from "@/services/patient.service"
import { ReservationService } from "@/services/reservation.service"
import type { Reservation } from "@/services/reservation.service"
import { MedicalRecordService } from "@/services/medical-record.service"
import type { MedicalRecord } from "@/services/medical-record.service"
import { PrescriptionService, PrescriptionStatus, type Prescription } from "@/services/prescription.service"
import { toast } from "sonner"

export interface Patient {
  id: string
  name: string
  birthDate: string
  gender: string
  phone: string
  lastVisit: string
  status: "입원" | "외래" | "퇴원"
  emergencyContact?: string
  bloodType?: string
  address?: string
  insuranceInfo?: string
  allergies?: string
  /** 예약만으로 등록된 경우 부가 설명 */
  subtitle?: string
  /** 상세 정보 없이 예약으로만 조회된 경우 */
  fromReservationOnly?: boolean
}

function isPlaceholderGender(g: string | undefined): boolean {
  const t = (g ?? "").trim()
  return t === "" || t === "-" || t === "미입력"
}

function isPlaceholderBirth(b: string | undefined): boolean {
  const t = (b ?? "").trim()
  return t === "" || t === "—" || t === "상세 미등록" || t === "미등록"
}

function formatBasicPatientSummary(p: Patient): string {
  const chunks: string[] = [p.name]
  if (!isPlaceholderGender(p.gender)) {
    chunks.push(`(${p.gender})`)
  }
  if (!isPlaceholderBirth(p.birthDate)) {
    chunks.push(p.birthDate)
  }
  return chunks.join(" ")
}

function mapDtoToPatient(dto: PatientDetailsDto): Patient {
  return {
    id: String(dto.userId),
    name: dto.name?.trim() ? dto.name : "(이름 없음)",
    birthDate: dto.birthDate?.trim() ? dto.birthDate.trim() : "—",
    gender: dto.gender?.trim() ? dto.gender : "—",
    phone: dto.phone?.trim() ? dto.phone : "—",
    lastVisit: "—",
    status: "외래",
    emergencyContact: dto.emergencyContact,
    bloodType: dto.bloodType,
    address: dto.address,
    insuranceInfo: dto.insuranceInfo,
    allergies: dto.allergies,
    fromReservationOnly: dto.patientDetailsRegistered === false,
  }
}

function parseAllergyList(allergies?: string) {
  if (!allergies?.trim()) return []
  return allergies
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatReservationStatus(status: string): string {
  switch (status) {
    case "WAITING":
      return "예약대기"
    case "NURSE_APPROVED":
      return "접수완료"
    case "COMPLETED":
      return "진료완료"
    default:
      return status
  }
}

function formatPrescriptionStatus(s: PrescriptionStatus): string {
  switch (s) {
    case PrescriptionStatus.PENDING:
      return "대기"
    case PrescriptionStatus.APPROVED:
      return "승인"
    case PrescriptionStatus.REJECTED:
      return "거절"
    default:
      return s
  }
}

interface NursePatientLookupProps {
  onSelectPatient: (patient: Patient) => void
  selectedPatient: Patient | null
}

export function NursePatientLookup({ onSelectPatient, selectedPatient }: NursePatientLookupProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [patientDetailSync, setPatientDetailSync] = useState(false)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [patientReservations, setPatientReservations] = useState<Reservation[]>([])
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([])
  const [emrExtraLoading, setEmrExtraLoading] = useState(false)

  const loadPatients = useCallback(async () => {
    setLoading(true)
    try {
      const list = await PatientService.getAll()
      setPatients(list.map(mapDtoToPatient))
    } catch {
      toast.error("환자 목록을 불러오지 못했습니다.")
      setPatients([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPatients()
  }, [loadPatients])

  useEffect(() => {
    if (!selectedPatient) {
      setPatientDetailSync(false)
      return
    }
    const pid = parseInt(selectedPatient.id, 10)
    if (Number.isNaN(pid)) {
      setPatientDetailSync(false)
      return
    }
    const needsHydration =
      selectedPatient.fromReservationOnly === true ||
      isPlaceholderBirth(selectedPatient.birthDate)

    if (!needsHydration) {
      setPatientDetailSync(false)
      return
    }

    let cancelled = false
    setPatientDetailSync(true)
    ;(async () => {
      try {
        const dto = await PatientService.getLookupForStaff(pid)
        if (cancelled) return
        const merged = mapDtoToPatient(dto)
        const sub = selectedPatient.subtitle?.trim()
        const withSubtitle =
          dto.patientDetailsRegistered === false && sub ? { ...merged, subtitle: sub } : merged
        onSelectPatient(withSubtitle)
        setPatients((prev) => prev.map((p) => (p.id === withSubtitle.id ? withSubtitle : p)))
      } catch {
        if (!cancelled) toast.error("환자 정보를 서버에서 불러오지 못했습니다.")
      } finally {
        if (!cancelled) setPatientDetailSync(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    selectedPatient?.id,
    selectedPatient?.fromReservationOnly,
    selectedPatient?.birthDate,
    selectedPatient?.subtitle,
    onSelectPatient,
  ])

  useEffect(() => {
    if (!selectedPatient) {
      setMedicalRecords([])
      return
    }
    const pid = parseInt(selectedPatient.id, 10)
    if (Number.isNaN(pid)) {
      setMedicalRecords([])
      return
    }
    let cancelled = false
    setRecordsLoading(true)
    MedicalRecordService.getByPatient(pid)
      .then((rows) => {
        if (cancelled) return
        const sorted = [...rows].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setMedicalRecords(sorted)
      })
      .catch(() => {
        if (!cancelled) {
          setMedicalRecords([])
          toast.error("진료 기록을 불러오지 못했습니다.")
        }
      })
      .finally(() => {
        if (!cancelled) setRecordsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedPatient?.id])

  useEffect(() => {
    if (!selectedPatient) {
      setPatientReservations([])
      setPatientPrescriptions([])
      return
    }
    const pid = parseInt(selectedPatient.id, 10)
    if (Number.isNaN(pid)) {
      setPatientReservations([])
      setPatientPrescriptions([])
      return
    }
    let cancelled = false
    setEmrExtraLoading(true)
    Promise.all([
      ReservationService.getByPatientId(pid).catch(() => [] as Reservation[]),
      PrescriptionService.getByPatient(pid).catch(() => [] as Prescription[]),
    ])
      .then(([revs, pxs]) => {
        if (cancelled) return
        setPatientReservations(
          [...revs].sort(
            (a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime()
          )
        )
        setPatientPrescriptions(
          [...pxs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        )
      })
      .catch(() => {
        if (!cancelled) {
          setPatientReservations([])
          setPatientPrescriptions([])
          toast.error("예약·처방 이력을 불러오지 못했습니다.")
        }
      })
      .finally(() => {
        if (!cancelled) setEmrExtraLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedPatient?.id])

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.includes(searchQuery) ||
      patient.id.includes(searchQuery) ||
      patient.phone.includes(searchQuery)
  )

  const getStatusColor = (status: Patient["status"]) => {
    switch (status) {
      case "입원":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "외래":
        return "bg-green-100 text-green-800 border-green-200"
      case "퇴원":
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleSelectPatientRow = (patient: Patient) => {
    onSelectPatient(patient)
  }

  const allergyItems = selectedPatient ? parseAllergyList(selectedPatient.allergies) : []
  const latestVisitLabel = medicalRecords[0]
    ? new Date(medicalRecords[0].createdAt).toLocaleDateString("ko-KR")
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">환자 조회</CardTitle>
            <CardDescription>이름·환자번호·연락처로 검색</CardDescription>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={() => void loadPatients()} disabled={loading} title="새로고침">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="환자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {loading && patients.length === 0 ? (
              <div className="flex justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleSelectPatientRow(patient)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors hover:bg-secondary/50",
                    selectedPatient?.id === patient.id && "bg-primary/5 border-primary/30",
                    patientDetailSync && selectedPatient?.id === patient.id && "opacity-80"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        {patientDetailSync && selectedPatient?.id === patient.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{patient.name}</span>
                          {isMeaningfulPatientGender(patient.gender) && (
                            <span className="text-xs text-muted-foreground">({patient.gender})</span>
                          )}
                          <Badge variant="outline" className={cn("text-xs", getStatusColor(patient.status))}>
                            {patient.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>ID {patient.id}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {patient.birthDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground pl-13">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone}
                    </span>
                  </div>
                </button>
              ))
            )}
            {!loading && filteredPatients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {patients.length === 0 ? "등록된 환자가 없습니다." : "검색 결과가 없습니다"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          {selectedPatient ? (
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 flex-wrap">
                  {selectedPatient.name}
                  {!isPlaceholderGender(selectedPatient.gender) && (
                    <Badge variant="secondary">{selectedPatient.gender}</Badge>
                  )}
                  <Badge variant="outline" className={cn("text-xs", getStatusColor(selectedPatient.status))}>
                    {selectedPatient.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  환자번호: {selectedPatient.id}
                  {!isPlaceholderBirth(selectedPatient.birthDate) && (
                    <> | 생년월일: {selectedPatient.birthDate}</>
                  )}
                  {latestVisitLabel && ` | 최근 진료: ${latestVisitLabel}`}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                <AlertCircle className="h-3 w-3 mr-1" />
                읽기 전용
              </Badge>
            </div>
          ) : (
            <div>
              <CardTitle>환자 EMR</CardTitle>
              <CardDescription>환자를 선택하면 EMR 정보가 표시됩니다</CardDescription>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!selectedPatient ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <User className="h-16 w-16 mb-4 text-muted-foreground/30" />
              <p>왼쪽 목록에서 환자를 선택해주세요</p>
            </div>
          ) : (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic" className="text-xs">
                  기본정보
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs">
                  진료기록
                </TabsTrigger>
                <TabsTrigger value="tests" className="text-xs">
                  검사결과
                </TabsTrigger>
                <TabsTrigger value="nursing" className="text-xs">
                  간호기록
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[420px] pr-4">
                <TabsContent value="basic" className="mt-0 space-y-4">
                  <div className="grid gap-4">
                    {selectedPatient.fromReservationOnly && (
                    <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>
                        상세 정보가 등록되지 않은 환자입니다. 이름·연락처는 표시되며, 생년월일·혈액형 등은 상세 등록 후
                        확인할 수 있습니다.
                      </p>
                    </div>
                    )}
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">환자 정보</p>
                        <p className="text-sm text-muted-foreground">{formatBasicPatientSummary(selectedPatient)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">연락처</p>
                        <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">혈액형</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.bloodType?.trim() || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">보험</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.insuranceInfo?.trim() || "—"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">알레르기</p>
                      {allergyItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">등록된 알레르기 정보가 없습니다</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {allergyItems.map((allergy) => (
                            <Badge key={allergy} variant="destructive" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 space-y-4">
                  {recordsLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      진료 기록을 불러오는 중…
                    </div>
                  ) : medicalRecords.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">등록된 진료 기록이 없습니다</p>
                  ) : (
                    <div className="space-y-4">
                      {medicalRecords.map((rec) => (
                        <div key={rec.recordId} className="border rounded-lg p-3 space-y-2 bg-secondary/20">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(rec.createdAt).toLocaleString("ko-KR")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              기록 {rec.recordId}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4" />
                              진단
                            </h4>
                            <p className="text-sm text-muted-foreground bg-background/80 p-2 rounded-md">
                              {rec.diagnosis?.trim() || "-"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">치료·소견</h4>
                            <p className="text-sm text-muted-foreground bg-background/80 p-2 rounded-md whitespace-pre-wrap">
                              {rec.treatmentNotes?.trim() || "-"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tests" className="mt-0 space-y-4">
                  {emrExtraLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      처방 이력을 불러오는 중…
                    </div>
                  ) : patientPrescriptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">등록된 처방이 없습니다</p>
                  ) : (
                    <div className="space-y-3">
                      {patientPrescriptions.map((px) => (
                        <div key={px.prescriptionId} className="border rounded-lg p-3 space-y-2 bg-secondary/20">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(px.createdAt).toLocaleString("ko-KR")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formatPrescriptionStatus(px.status)}
                            </Badge>
                          </div>
                          <div className="flex items-start gap-2">
                            <TestTube className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{px.medication}</p>
                              <p className="text-sm text-muted-foreground">용량: {px.dosage?.trim() || "-"}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                처방 {px.prescriptionId}
                                {px.reservationId != null ? ` · 예약 ${px.reservationId}` : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="nursing" className="mt-0 space-y-4">
                  {emrExtraLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      예약 이력을 불러오는 중…
                    </div>
                  ) : patientReservations.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">예약 이력이 없습니다</p>
                  ) : (
                    <div className="space-y-3">
                      {patientReservations.map((rv) => (
                        <div key={rv.reservationId} className="border rounded-lg p-3 space-y-2 bg-secondary/20">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(rv.reservationDate).toLocaleString("ko-KR")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formatReservationStatus(rv.status)}
                            </Badge>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clipboard className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="text-sm text-muted-foreground">
                                예약 {rv.reservationId} · 담당의 {rv.doctorId}
                              </p>
                              {rv.symptoms?.trim() && (
                                <p className="text-sm mt-1 whitespace-pre-wrap">{rv.symptoms.trim()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
