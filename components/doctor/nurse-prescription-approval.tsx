"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X, Clock, User, Loader2 } from "lucide-react"
import { PrescriptionService, Prescription, PrescriptionStatus } from "@/services/prescription.service"
import { PatientService } from "@/services/patient.service"
import { toast } from "sonner"

export function NursePrescriptionApproval() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patientNames, setPatientNames] = useState<Map<number, string>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const fetchPendingPrescriptions = async () => {
    setIsLoading(true)
    try {
      const data = await PrescriptionService.getAll({ status: PrescriptionStatus.PENDING })
      // 간호사가 요청한 처방만 (의사 직접 처방은 백엔드에서 APPROVED 처리)
      const nursePending = data.filter((p) => p.nurseId != null)
      const ids = [...new Set(nursePending.map((p) => p.patientId))]
      const nameMap = new Map<number, string>()
      await Promise.all(
        ids.map(async (userId) => {
          try {
            const lu = await PatientService.getLookupForStaff(userId)
            const n = lu.name?.trim()
            nameMap.set(userId, n && n.length > 0 ? n : `환자 #${userId}`)
          } catch {
            nameMap.set(userId, `환자 #${userId}`)
          }
        })
      )
      setPatientNames(nameMap)
      setPrescriptions(nursePending)
    } catch (error) {
      toast.error("대기 중인 처방 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingPrescriptions()
  }, [])

  const handleApprove = async (prescription: Prescription) => {
    try {
      await PrescriptionService.approve(prescription.prescriptionId)
      toast.success("처방이 승인되었습니다.")
      fetchPendingPrescriptions()
    } catch (error) {
      toast.error("승인 처리에 실패했습니다.")
    }
  }

  const handleReject = async () => {
    if (selectedPrescription) {
      try {
        await PrescriptionService.reject(selectedPrescription.prescriptionId)
        toast.success("처방이 반려되었습니다.")
        setIsRejectDialogOpen(false)
        setSelectedPrescription(null)
        setRejectReason("")
        fetchPendingPrescriptions()
      } catch (error) {
        toast.error("반려 처리에 실패했습니다.")
      }
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              승인 대기 중인 처방이 없습니다
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.prescriptionId}
                    className="p-4 border rounded-lg hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {patientNames.get(prescription.patientId) ?? `환자 #${prescription.patientId}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              (환자 ID {prescription.patientId}) · 처방 #{prescription.prescriptionId}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            요청 간호사 ID: {prescription.nurseId ?? "—"} | {new Date(prescription.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 p-2 bg-secondary/30 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-start gap-2 text-sm">
                          <Badge variant="outline" className="text-xs shrink-0">{prescription.medication}</Badge>
                          <span className="text-muted-foreground">{prescription.dosage}</span>
                        </div>
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
              반려 사유를 입력해주세요. (현재 백엔드 사유 저장 미지원)
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
            <Button variant="destructive" onClick={handleReject}>
              반려 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
