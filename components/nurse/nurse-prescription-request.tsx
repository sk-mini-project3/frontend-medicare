"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Pill, Trash2, Send, Clock, CheckCircle, XCircle, AlertTriangle, User, Loader2 } from "lucide-react"
import type { Patient } from "@/components/nurse/nurse-patient-lookup"
import {
  PrescriptionService,
  type Prescription,
  PrescriptionStatus,
} from "@/services/prescription.service"
import { PatientService } from "@/services/patient.service"
import { useAuthStore } from "@/hooks/use-auth-store"
import { getNumericUserId } from "@/lib/auth-user"
import { toast } from "sonner"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  timing: string[]
  duration: string
  instructions?: string
}

const commonMedications = [
  { name: "아모잘탄정", category: "고혈압" },
  { name: "메트포르민정", category: "당뇨" },
  { name: "타이레놀정", category: "해열진통" },
  { name: "오메프라졸캡슐", category: "위장약" },
  { name: "세티리진정", category: "알레르기" },
  { name: "이부프로펜정", category: "소염진통" },
  { name: "둘코락스정", category: "변비약" },
  { name: "로페라마이드캡슐", category: "지사제" },
]

const frequencyOptions = [
  { value: "1", label: "하루 1회" },
  { value: "2", label: "하루 2회" },
  { value: "3", label: "하루 3회" },
  { value: "prn", label: "필요시" },
]

const timingOptions = [
  { value: "morning", label: "아침" },
  { value: "lunch", label: "점심" },
  { value: "dinner", label: "저녁" },
  { value: "bedtime", label: "취침전" },
]

function getTimingLabel(timing: string[]) {
  const labels: Record<string, string> = {
    morning: "아침",
    lunch: "점심",
    dinner: "저녁",
    bedtime: "취침전",
  }
  return timing.map((t) => labels[t]).join(", ")
}

function getFrequencyLabel(freq: string) {
  const labels: Record<string, string> = {
    "1": "하루 1회",
    "2": "하루 2회",
    "3": "하루 3회",
    prn: "필요시",
  }
  return labels[freq] || freq
}

function urgencyLabelKo(u: "normal" | "urgent" | "emergency") {
  switch (u) {
    case "normal":
      return "일반"
    case "urgent":
      return "긴급"
    case "emergency":
      return "응급"
  }
}

function buildDosagePayload(
  diagnosis: string,
  reason: string,
  urgency: "normal" | "urgent" | "emergency",
  med: Medication
) {
  const meta = `[진단] ${diagnosis} | [사유] ${reason} | [긴급도] ${urgencyLabelKo(urgency)}`
  const detail = [
    med.dosage,
    getFrequencyLabel(med.frequency),
    getTimingLabel(med.timing),
    med.duration,
    med.instructions,
  ]
    .filter(Boolean)
    .join(" | ")
  return `${meta}\n${detail}`
}

function parseNurseDosage(dosage: string) {
  const lines = dosage.split(/\r?\n/)
  const meta = lines[0] ?? ""
  const detail = lines.length > 1 ? lines.slice(1).join("\n").trim() : dosage.trim()
  const urgencyRaw = meta.match(/\[긴급도\]\s*([^|]+)/)?.[1]?.trim()
  const diagnosis = meta.match(/\[진단\]\s*([^|]+)/)?.[1]?.trim()
  const reason = meta.match(/\[사유\]\s*([^|]+)/)?.[1]?.trim()
  let urgency: "normal" | "urgent" | "emergency" = "normal"
  if (urgencyRaw?.includes("응급")) urgency = "emergency"
  else if (urgencyRaw?.includes("긴급")) urgency = "urgent"
  const hasMeta = /\[진단\]/.test(meta)
  return { detail: detail || dosage, diagnosis, reason, urgency, hasMeta }
}

interface NursePrescriptionRequestProps {
  patient: Patient | null
}

export function NursePrescriptionRequest({ patient }: NursePrescriptionRequestProps) {
  const { user } = useAuthStore()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [patientNames, setPatientNames] = useState<Record<number, string>>({})

  const [medications, setMedications] = useState<Medication[]>([])
  const [isAddingMed, setIsAddingMed] = useState(false)
  const [newMed, setNewMed] = useState<Partial<Medication>>({ timing: [] })
  const [diagnosis, setDiagnosis] = useState("")
  const [reason, setReason] = useState("")
  const [urgency, setUrgency] = useState<"normal" | "urgent" | "emergency">("normal")

  const loadPrescriptions = useCallback(async () => {
    if (!user) return
    const nid = getNumericUserId(user)
    setListLoading(true)
    try {
      const data =
        nid != null
          ? await PrescriptionService.getAll({ nurseId: nid })
          : await PrescriptionService.getAll()
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setPrescriptions(sorted)
    } catch {
      toast.error("임시 처방 목록을 불러오지 못했습니다.")
    } finally {
      setListLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadPrescriptions()
  }, [loadPrescriptions])

  useEffect(() => {
    PatientService.getAll()
      .then((list) => {
        const m: Record<number, string> = {}
        for (const p of list) {
          m[p.userId] = p.name?.trim() ? p.name : `환자 #${p.userId}`
        }
        setPatientNames(m)
      })
      .catch(() => {})
  }, [])

  const handleAddMedication = () => {
    if (newMed.name && newMed.dosage && newMed.frequency && newMed.duration) {
      setMedications([
        ...medications,
        {
          id: Date.now().toString(),
          name: newMed.name,
          dosage: newMed.dosage,
          frequency: newMed.frequency,
          timing: newMed.timing || [],
          duration: newMed.duration,
          instructions: newMed.instructions,
        },
      ])
      setNewMed({ timing: [] })
      setIsAddingMed(false)
    }
  }

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id))
  }

  const handleTimingToggle = (timing: string) => {
    const currentTiming = newMed.timing || []
    if (currentTiming.includes(timing)) {
      setNewMed({ ...newMed, timing: currentTiming.filter((t) => t !== timing) })
    } else {
      setNewMed({ ...newMed, timing: [...currentTiming, timing] })
    }
  }

  const handleSubmitRequest = async () => {
    if (!patient) return
    if (!user?.id) {
      toast.error("로그인 정보가 없습니다.")
      return
    }
    const nurseId = getNumericUserId(user)
    if (nurseId == null) {
      toast.error("로그인 정보가 올바르지 않습니다.")
      return
    }
    const patientId = parseInt(patient.id, 10)
    if (Number.isNaN(patientId)) {
      toast.error("환자 ID가 올바르지 않습니다.")
      return
    }

    setSubmitting(true)
    try {
      for (const med of medications) {
        await PrescriptionService.create({
          patientId,
          nurseId,
          medication: med.name,
          dosage: buildDosagePayload(diagnosis, reason, urgency, med),
        })
      }
      toast.success("의사 승인 요청이 등록되었습니다.")
      setMedications([])
      setDiagnosis("")
      setReason("")
      setUrgency("normal")
      await loadPrescriptions()
    } catch {
      toast.error("임시 처방 등록에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: PrescriptionStatus) => {
    switch (status) {
      case PrescriptionStatus.PENDING:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            대기중
          </Badge>
        )
      case PrescriptionStatus.APPROVED:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            승인됨
          </Badge>
        )
      case PrescriptionStatus.REJECTED:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            반려됨
          </Badge>
        )
    }
  }

  const getUrgencyBadge = (u: "normal" | "urgent" | "emergency") => {
    switch (u) {
      case "normal":
        return (
          <Badge variant="secondary" className="text-xs">
            일반
          </Badge>
        )
      case "urgent":
        return (
          <Badge variant="default" className="text-xs bg-orange-500">
            긴급
          </Badge>
        )
      case "emergency":
        return (
          <Badge variant="destructive" className="text-xs">
            응급
          </Badge>
        )
    }
  }

  const pendingCount = prescriptions.filter((r) => r.status === PrescriptionStatus.PENDING).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5" />
            임시 처방 요청
          </CardTitle>
          <CardDescription>
            {patient
              ? `${patient.name} 환자에 대한 임시 처방을 작성하세요`
              : "환자를 먼저 선택해주세요"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!patient ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>환자 조회 탭에서 환자를 먼저 선택해주세요</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{patient.id}</Badge>
                  <span className="font-medium">{patient.name}</span>
                  <span className="text-sm text-muted-foreground">({patient.gender})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">진단명 / 증상</Label>
                  <Input
                    id="diagnosis"
                    placeholder="예: 급성 위염, 고열"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>긴급도</Label>
                  <Select
                    value={urgency}
                    onValueChange={(value: "normal" | "urgent" | "emergency") => setUrgency(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">일반</SelectItem>
                      <SelectItem value="urgent">긴급</SelectItem>
                      <SelectItem value="emergency">응급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">요청 사유</Label>
                <Textarea
                  id="reason"
                  placeholder="처방이 필요한 이유를 상세히 기술해주세요"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>요청 약물</Label>
                  <Dialog open={isAddingMed} onOpenChange={setIsAddingMed}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        약물 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>약물 추가</DialogTitle>
                        <DialogDescription>요청할 약물 정보를 입력하세요</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>약물명</Label>
                          <Select onValueChange={(value) => setNewMed({ ...newMed, name: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="약물 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonMedications.map((med) => (
                                <SelectItem key={med.name} value={med.name}>
                                  <span>{med.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">({med.category})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>용량</Label>
                            <Input
                              placeholder="예: 500mg"
                              value={newMed.dosage || ""}
                              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>투약 기간</Label>
                            <Input
                              placeholder="예: 7일"
                              value={newMed.duration || ""}
                              onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>복용 횟수</Label>
                          <Select onValueChange={(value) => setNewMed({ ...newMed, frequency: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="복용 횟수 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencyOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>복용 시간</Label>
                          <div className="flex flex-wrap gap-2">
                            {timingOptions.map((opt) => (
                              <Button
                                key={opt.value}
                                type="button"
                                variant={newMed.timing?.includes(opt.value) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleTimingToggle(opt.value)}
                              >
                                {opt.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>복용 지침 (선택)</Label>
                          <Textarea
                            placeholder="예: 식후 30분 복용"
                            value={newMed.instructions || ""}
                            onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingMed(false)}>
                          취소
                        </Button>
                        <Button onClick={handleAddMedication}>추가</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {medications.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg text-sm">
                    요청할 약물을 추가하세요
                  </div>
                ) : (
                  <div className="space-y-2">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-start justify-between p-3 border rounded-lg bg-secondary/20"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{med.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {med.dosage}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getFrequencyLabel(med.frequency)} | {getTimingLabel(med.timing)} | {med.duration}
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground">{med.instructions}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveMedication(med.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800">임시 처방은 담당 의사의 승인 후 발행됩니다</span>
              </div>

              <Button
                className="w-full"
                disabled={medications.length === 0 || !diagnosis || !reason || submitting}
                onClick={() => void handleSubmitRequest()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    전송 중…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    의사에게 승인 요청
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            요청 내역
            {pendingCount > 0 && <Badge variant="secondary">{pendingCount}건 대기중</Badge>}
          </CardTitle>
          <CardDescription>본인이 요청한 임시 처방 (서버 연동)</CardDescription>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="flex justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">대기중</TabsTrigger>
                <TabsTrigger value="approved">승인됨</TabsTrigger>
                <TabsTrigger value="rejected">반려됨</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-[500px] mt-4">
                <TabsContent value="pending" className="mt-0">
                  <ApiPrescriptionList
                    items={prescriptions.filter((r) => r.status === PrescriptionStatus.PENDING)}
                    patientNames={patientNames}
                    getStatusBadge={getStatusBadge}
                    getUrgencyBadge={getUrgencyBadge}
                  />
                </TabsContent>
                <TabsContent value="approved" className="mt-0">
                  <ApiPrescriptionList
                    items={prescriptions.filter((r) => r.status === PrescriptionStatus.APPROVED)}
                    patientNames={patientNames}
                    getStatusBadge={getStatusBadge}
                    getUrgencyBadge={getUrgencyBadge}
                  />
                </TabsContent>
                <TabsContent value="rejected" className="mt-0">
                  <ApiPrescriptionList
                    items={prescriptions.filter((r) => r.status === PrescriptionStatus.REJECTED)}
                    patientNames={patientNames}
                    getStatusBadge={getStatusBadge}
                    getUrgencyBadge={getUrgencyBadge}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ApiPrescriptionList({
  items,
  patientNames,
  getStatusBadge,
  getUrgencyBadge,
}: {
  items: Prescription[]
  patientNames: Record<number, string>
  getStatusBadge: (status: PrescriptionStatus) => ReactNode
  getUrgencyBadge: (u: "normal" | "urgent" | "emergency") => ReactNode
}) {
  if (items.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">요청 내역이 없습니다</div>
  }

  return (
    <div className="space-y-3">
      {items.map((rx) => {
        const parsed = parseNurseDosage(rx.dosage || "")
        const patientName = patientNames[rx.patientId] ?? `환자 #${rx.patientId}`
        return (
          <div key={rx.prescriptionId} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{patientName}</span>
                  <span className="text-xs text-muted-foreground">(환자 ID {rx.patientId})</span>
                  {getUrgencyBadge(parsed.urgency)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {parsed.hasMeta ? parsed.diagnosis || "진단 정보 없음" : "진료/임시 처방"}
                </p>
              </div>
              {getStatusBadge(rx.status)}
            </div>

            <div className="text-sm p-2 bg-secondary/30 rounded">
              <span className="font-medium">{rx.medication}</span>
              <p className="text-muted-foreground mt-1 whitespace-pre-wrap text-xs leading-relaxed">
                {parsed.detail}
              </p>
            </div>

            {parsed.hasMeta && parsed.reason && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">요청 사유:</span> {parsed.reason}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>{rx.nurseId != null ? `간호사 ID ${rx.nurseId}` : "간호사 정보 없음"}</span>
              <span>{new Date(rx.createdAt).toLocaleString("ko-KR")}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
