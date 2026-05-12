"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Phone, MapPin, FileText, Loader2, Pill } from "lucide-react"
import type { Patient } from "./patient-search"
import { isMeaningfulPatientGender } from "@/lib/utils"
import { PatientService, type PatientDetailsDto } from "@/services/patient.service"
import { MedicalRecordService, type MedicalRecord } from "@/services/medical-record.service"
import { PrescriptionService } from "@/services/prescription.service"
import { toast } from "sonner"

interface PatientEMRProps {
  patient: Patient
}

export function PatientEMR({ patient }: PatientEMRProps) {
  const [lookup, setLookup] = useState<PatientDetailsDto | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [rxCount, setRxCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const uid = patient.userId
    async function run() {
      setLoading(true)
      try {
        const [lu, recs, rx] = await Promise.all([
          PatientService.getLookupForStaff(uid),
          MedicalRecordService.getByPatient(uid),
          PrescriptionService.getByPatient(uid).catch(() => []),
        ])
        if (!cancelled) {
          setLookup(lu)
          setRecords(recs)
          setRxCount(rx.length)
        }
      } catch {
        if (!cancelled) {
          toast.error("EMR 정보를 불러오지 못했습니다.")
          setLookup(null)
          setRecords([])
          setRxCount(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [patient.userId])

  const allergies =
    lookup?.allergies
      ?.split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean) ?? []

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 flex-wrap">
              {patient.name}
              {isMeaningfulPatientGender(lookup?.gender || patient.gender) && (
                <Badge variant="secondary">{lookup?.gender || patient.gender}</Badge>
              )}
              {rxCount != null && (
                <Badge variant="outline" className="text-xs font-normal gap-1">
                  <Pill className="h-3 w-3" />
                  처방 {rxCount}건
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              환자번호(userId): {patient.userId} | 생년월일: {lookup?.birthDate || patient.birthDate}
            </CardDescription>
          </div>
          {loading && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="basic" className="text-xs">
              기본정보
            </TabsTrigger>
            <TabsTrigger value="records" className="text-xs">
              진료기록
            </TabsTrigger>
            <TabsTrigger value="extra" className="text-xs">
              안내
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[450px] pr-4">
            <TabsContent value="basic" className="mt-0 space-y-4">
              {!lookup && loading ? (
                <p className="text-sm text-muted-foreground">불러오는 중…</p>
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">환자 정보</p>
                      <p className="text-sm text-muted-foreground">{lookup?.name || patient.name}</p>
                      {lookup?.patientDetailsRegistered === false && (
                        <p className="text-xs text-amber-700 mt-1">patient_details 미등록 — 계정만 존재합니다.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">연락처</p>
                      <p className="text-sm text-muted-foreground">{lookup?.phone || patient.phone}</p>
                      {lookup?.emergencyContact ? (
                        <p className="text-sm text-muted-foreground">비상연락처: {lookup.emergencyContact}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">주소</p>
                      <p className="text-sm text-muted-foreground">{lookup?.address?.trim() || "—"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">혈액형</p>
                      <p className="text-sm text-muted-foreground">{lookup?.bloodType?.trim() || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">보험</p>
                      <p className="text-sm text-muted-foreground">{lookup?.insuranceInfo?.trim() || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">알레르기</p>
                    {allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {allergies.map((a) => (
                          <Badge key={a} variant="destructive" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">등록된 알레르기 없음</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="records" className="mt-0 space-y-4">
              <div className="space-y-3">
                {records.length === 0 && !loading ? (
                  <p className="text-sm text-muted-foreground">
                    저장된 진료기록이 없습니다. (/api/medical-records/patient/{patient.userId})
                  </p>
                ) : null}
                {records.map((r) => (
                  <div key={r.recordId} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">
                        기록 #{r.recordId}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        진단
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{r.diagnosis || "—"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">소견·처치</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{r.treatmentNotes || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="extra" className="mt-0 space-y-3 text-sm text-muted-foreground">
              <p>검사·영상·간호기록 등 세부 EMR은 백엔드 모델에 맞추어 단계적으로 연동할 수 있습니다.</p>
              <p>처방 목록은 우측「진료 기록 및 처방」또는「처방 관리」탭에서 확인·발행할 수 있습니다.</p>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
