"use client"

import { useState } from "react"
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
import { Plus, Pill, Trash2, Send, Clock, CheckCircle, XCircle, AlertTriangle, User } from "lucide-react"
import type { Patient } from "@/components/doctor/patient-search"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  timing: string[]
  duration: string
  instructions?: string
}

interface PrescriptionRequest {
  id: string
  patientId: string
  patientName: string
  diagnosis: string
  medications: Medication[]
  reason: string
  urgency: "normal" | "urgent" | "emergency"
  status: "pending" | "approved" | "rejected"
  requestedAt: string
  requestedBy: string
  doctorNote?: string
}

const mockPrescriptionRequests: PrescriptionRequest[] = [
  {
    id: "PR-001",
    patientId: "P-2024-002",
    patientName: "이철수",
    diagnosis: "급성 위염",
    medications: [
      { id: "1", name: "오메프라졸캡슐", dosage: "20mg", frequency: "2", timing: ["morning", "dinner"], duration: "7일", instructions: "식전 30분 복용" },
    ],
    reason: "속쓰림 증상 호소하여 위장약 필요",
    urgency: "normal",
    status: "pending",
    requestedAt: "2024-01-15 10:30",
    requestedBy: "박간호사",
  },
  {
    id: "PR-002",
    patientId: "P-2024-005",
    patientName: "정수연",
    diagnosis: "고열",
    medications: [
      { id: "2", name: "타이레놀정", dosage: "500mg", frequency: "3", timing: ["morning", "lunch", "dinner"], duration: "3일", instructions: "식후 복용" },
    ],
    reason: "38.5도 고열 지속, 해열제 필요",
    urgency: "urgent",
    status: "pending",
    requestedAt: "2024-01-15 09:15",
    requestedBy: "박간호사",
  },
  {
    id: "PR-003",
    patientId: "P-2024-001",
    patientName: "김영희",
    diagnosis: "알레르기 반응",
    medications: [
      { id: "3", name: "세티리진정", dosage: "10mg", frequency: "1", timing: ["bedtime"], duration: "5일" },
    ],
    reason: "피부 발진 및 가려움 증상",
    urgency: "normal",
    status: "approved",
    requestedAt: "2024-01-14 14:20",
    requestedBy: "박간호사",
    doctorNote: "승인. 증상 지속 시 재진 필요",
  },
  {
    id: "PR-004",
    patientId: "P-2024-003",
    patientName: "박지민",
    diagnosis: "두통",
    medications: [
      { id: "4", name: "이부프로펜정", dosage: "400mg", frequency: "2", timing: ["morning", "dinner"], duration: "3일" },
    ],
    reason: "두통 호소",
    urgency: "normal",
    status: "rejected",
    requestedAt: "2024-01-14 11:00",
    requestedBy: "최간호사",
    doctorNote: "환자 위장 문제 이력 있음. 타이레놀로 대체 필요",
  },
]

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

interface NursePrescriptionRequestProps {
  patient: Patient | null
}

export function NursePrescriptionRequest({ patient }: NursePrescriptionRequestProps) {
  const [prescriptionRequests, setPrescriptionRequests] = useState<PrescriptionRequest[]>(mockPrescriptionRequests)
  const [medications, setMedications] = useState<Medication[]>([])
  const [isAddingMed, setIsAddingMed] = useState(false)
  const [newMed, setNewMed] = useState<Partial<Medication>>({ timing: [] })
  const [diagnosis, setDiagnosis] = useState("")
  const [reason, setReason] = useState("")
  const [urgency, setUrgency] = useState<"normal" | "urgent" | "emergency">("normal")

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

  const getTimingLabel = (timing: string[]) => {
    const labels: Record<string, string> = {
      morning: "아침",
      lunch: "점심",
      dinner: "저녁",
      bedtime: "취침전",
    }
    return timing.map((t) => labels[t]).join(", ")
  }

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      "1": "하루 1회",
      "2": "하루 2회",
      "3": "하루 3회",
      "prn": "필요시",
    }
    return labels[freq] || freq
  }

  const handleSubmitRequest = () => {
    if (!patient) return

    const newRequest: PrescriptionRequest = {
      id: `PR-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      diagnosis,
      medications,
      reason,
      urgency,
      status: "pending",
      requestedAt: new Date().toLocaleString("ko-KR"),
      requestedBy: "박간호사",
    }
    setPrescriptionRequests([newRequest, ...prescriptionRequests])
    setMedications([])
    setDiagnosis("")
    setReason("")
    setUrgency("normal")
    alert("처방 승인 요청이 전송되었습니다.")
  }

  const getStatusBadge = (status: PrescriptionRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />대기중</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />승인됨</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />반려됨</Badge>
    }
  }

  const getUrgencyBadge = (urgency: PrescriptionRequest["urgency"]) => {
    switch (urgency) {
      case "normal":
        return <Badge variant="secondary" className="text-xs">일반</Badge>
      case "urgent":
        return <Badge variant="default" className="text-xs bg-orange-500">긴급</Badge>
      case "emergency":
        return <Badge variant="destructive" className="text-xs">응급</Badge>
    }
  }

  const pendingCount = prescriptionRequests.filter(r => r.status === "pending").length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 임시 처방 요청 폼 */}
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
                  <Select value={urgency} onValueChange={(value: "normal" | "urgent" | "emergency") => setUrgency(value)}>
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
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
                        <Button variant="outline" onClick={() => setIsAddingMed(false)}>취소</Button>
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
                      <div key={med.id} className="flex items-start justify-between p-3 border rounded-lg bg-secondary/20">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{med.name}</span>
                            <Badge variant="outline" className="text-xs">{med.dosage}</Badge>
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
                disabled={medications.length === 0 || !diagnosis || !reason}
                onClick={handleSubmitRequest}
              >
                <Send className="h-4 w-4 mr-2" />
                의사에게 승인 요청
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* 요청 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            요청 내역
            {pendingCount > 0 && (
              <Badge variant="secondary">{pendingCount}건 대기중</Badge>
            )}
          </CardTitle>
          <CardDescription>임시 처방 요청 및 승인 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">대기중</TabsTrigger>
              <TabsTrigger value="approved">승인됨</TabsTrigger>
              <TabsTrigger value="rejected">반려됨</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[500px] mt-4">
              <TabsContent value="pending" className="mt-0">
                <RequestList 
                  requests={prescriptionRequests.filter(r => r.status === "pending")}
                  getStatusBadge={getStatusBadge}
                  getUrgencyBadge={getUrgencyBadge}
                  getTimingLabel={getTimingLabel}
                  getFrequencyLabel={getFrequencyLabel}
                />
              </TabsContent>
              <TabsContent value="approved" className="mt-0">
                <RequestList 
                  requests={prescriptionRequests.filter(r => r.status === "approved")}
                  getStatusBadge={getStatusBadge}
                  getUrgencyBadge={getUrgencyBadge}
                  getTimingLabel={getTimingLabel}
                  getFrequencyLabel={getFrequencyLabel}
                />
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                <RequestList 
                  requests={prescriptionRequests.filter(r => r.status === "rejected")}
                  getStatusBadge={getStatusBadge}
                  getUrgencyBadge={getUrgencyBadge}
                  getTimingLabel={getTimingLabel}
                  getFrequencyLabel={getFrequencyLabel}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function RequestList({
  requests,
  getStatusBadge,
  getUrgencyBadge,
  getTimingLabel,
  getFrequencyLabel,
}: {
  requests: PrescriptionRequest[]
  getStatusBadge: (status: PrescriptionRequest["status"]) => React.ReactNode
  getUrgencyBadge: (urgency: PrescriptionRequest["urgency"]) => React.ReactNode
  getTimingLabel: (timing: string[]) => string
  getFrequencyLabel: (freq: string) => string
}) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        요청 내역이 없습니다
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div key={request.id} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{request.patientName}</span>
                <span className="text-xs text-muted-foreground">({request.patientId})</span>
                {getUrgencyBadge(request.urgency)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{request.diagnosis}</p>
            </div>
            {getStatusBadge(request.status)}
          </div>

          <div className="space-y-1">
            {request.medications.map((med) => (
              <div key={med.id} className="text-sm p-2 bg-secondary/30 rounded">
                <span className="font-medium">{med.name}</span>
                <span className="text-muted-foreground ml-2">
                  {med.dosage} | {getFrequencyLabel(med.frequency)} | {getTimingLabel(med.timing)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-medium">요청 사유:</span> {request.reason}
          </p>

          {request.doctorNote && (
            <div className={`text-sm p-2 rounded ${request.status === "approved" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              <span className="font-medium">의사 메모:</span> {request.doctorNote}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>{request.requestedBy}</span>
            <span>{request.requestedAt}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
