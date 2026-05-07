"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X, Clock, AlertTriangle, User } from "lucide-react"

interface PendingPrescription {
  id: string
  patientName: string
  patientId: string
  nurseName: string
  requestDate: string
  medications: {
    name: string
    dosage: string
    frequency: string
    timing: string[]
    duration: string
  }[]
  reason: string
  urgency: "일반" | "긴급"
}

const mockPendingPrescriptions: PendingPrescription[] = [
  {
    id: "RX-2024-001",
    patientName: "김영희",
    patientId: "P-2024-001",
    nurseName: "이간호사",
    requestDate: "2024-01-15 14:30",
    medications: [
      { name: "타이레놀정", dosage: "500mg", frequency: "3", timing: ["morning", "lunch", "dinner"], duration: "3일" },
    ],
    reason: "두통 호소로 인한 진통제 필요",
    urgency: "일반",
  },
  {
    id: "RX-2024-002",
    patientName: "이철수",
    patientId: "P-2024-002",
    nurseName: "최간호사",
    requestDate: "2024-01-15 15:10",
    medications: [
      { name: "아목시실린캡슐", dosage: "250mg", frequency: "3", timing: ["morning", "lunch", "dinner"], duration: "7일" },
      { name: "오메프라졸캡슐", dosage: "20mg", frequency: "1", timing: ["morning"], duration: "7일" },
    ],
    reason: "상기도 감염 증상으로 항생제 처방 요청",
    urgency: "긴급",
  },
  {
    id: "RX-2024-003",
    patientName: "정수연",
    patientId: "P-2024-005",
    nurseName: "이간호사",
    requestDate: "2024-01-15 16:45",
    medications: [
      { name: "세티리진정", dosage: "10mg", frequency: "1", timing: ["bedtime"], duration: "5일" },
    ],
    reason: "알레르기 증상 (두드러기) 발생",
    urgency: "일반",
  },
]

export function NursePrescriptionApproval() {
  const [prescriptions, setPrescriptions] = useState<PendingPrescription[]>(mockPendingPrescriptions)
  const [selectedPrescription, setSelectedPrescription] = useState<PendingPrescription | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

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

  const handleApprove = (prescription: PendingPrescription) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== prescription.id))
    setSelectedPrescription(null)
    alert(`${prescription.patientName} 환자의 처방이 승인되었습니다.`)
  }

  const handleReject = () => {
    if (selectedPrescription) {
      setPrescriptions(prescriptions.filter((p) => p.id !== selectedPrescription.id))
      setIsRejectDialogOpen(false)
      setSelectedPrescription(null)
      setRejectReason("")
      alert(`처방이 반려되었습니다.`)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            간호사 처방 승인 대기
            {prescriptions.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {prescriptions.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            간호사가 요청한 임시 처방을 검토하고 승인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              승인 대기 중인 처방이 없습니다
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="p-4 border rounded-lg hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{prescription.patientName}</span>
                            <span className="text-xs text-muted-foreground">({prescription.patientId})</span>
                            {prescription.urgency === "긴급" && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                긴급
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {prescription.nurseName} | {prescription.requestDate}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{prescription.id}</span>
                    </div>

                    <div className="mb-3 p-2 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">요청 사유: {prescription.reason}</p>
                      <div className="space-y-1">
                        {prescription.medications.map((med, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs">{med.name}</Badge>
                            <span>{med.dosage}</span>
                            <span className="text-muted-foreground">|</span>
                            <span className="text-muted-foreground">{getFrequencyLabel(med.frequency)}</span>
                            <span className="text-muted-foreground">|</span>
                            <span className="text-muted-foreground">{getTimingLabel(med.timing)}</span>
                            <span className="text-muted-foreground">|</span>
                            <span className="text-muted-foreground">{med.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(prescription)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPrescription(prescription)
                          setIsRejectDialogOpen(true)
                        }}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        반려
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>처방 반려</DialogTitle>
            <DialogDescription>
              반려 사유를 입력해주세요. 해당 내용은 간호사에게 전달됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason">반려 사유</Label>
            <Textarea
              id="rejectReason"
              placeholder="반려 사유를 입력하세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              반려
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
