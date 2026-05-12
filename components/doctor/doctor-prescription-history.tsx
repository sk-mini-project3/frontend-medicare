"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { PrescriptionService, type Prescription, PrescriptionStatus } from "@/services/prescription.service"
import { toast } from "sonner"

interface DoctorPrescriptionHistoryProps {
  doctorId: number | null
}

function statusLabel(s: PrescriptionStatus): string {
  switch (s) {
    case PrescriptionStatus.PENDING:
      return "대기"
    case PrescriptionStatus.APPROVED:
      return "승인"
    case PrescriptionStatus.REJECTED:
      return "반려"
    default:
      return s
  }
}

export function DoctorPrescriptionHistory({ doctorId }: DoctorPrescriptionHistoryProps) {
  const [items, setItems] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (doctorId == null) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await PrescriptionService.getAll({ doctorId })
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setItems(sorted)
    } catch {
      toast.error("처방 이력을 불러오지 못했습니다.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => {
    void load()
  }, [load])

  if (doctorId == null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">처방 이력</CardTitle>
          <CardDescription>로그인한 의사 ID를 확인할 수 없습니다.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">처방 이력</CardTitle>
          <CardDescription>본인이 작성한 처방 (/api/prescriptions?doctorId=)</CardDescription>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={() => void load()} disabled={loading} title="새로고침">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">표시할 처방이 없습니다.</p>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {items.map((p) => (
              <div key={p.prescriptionId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">환자 #{p.patientId}</span>
                    <Badge variant="outline" className="text-xs">
                      {statusLabel(p.status)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mt-1">{p.medication}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.dosage}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
