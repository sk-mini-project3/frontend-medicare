"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"
import { MedicalRecordService, type MedicalRecord } from "@/services/medical-record.service"
import { PatientService } from "@/services/patient.service"
import { toast } from "sonner"

interface DoctorMedicalRecordsListProps {
  doctorId: number | null
}

export function DoctorMedicalRecordsList({ doctorId }: DoctorMedicalRecordsListProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [nameMap, setNameMap] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (doctorId == null) {
      setRecords([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [recs, patients] = await Promise.all([
        MedicalRecordService.getByDoctorMe(),
        PatientService.getAll().catch(() => []),
      ])
      setRecords(recs)
      setNameMap(new Map(patients.map((p) => [p.userId, p.name])))
    } catch {
      toast.error("진료기록을 불러오지 못했습니다.")
      setRecords([])
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
          <CardTitle>진료 기록</CardTitle>
          <CardDescription>의사 계정을 확인할 수 없습니다.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>진료 기록</CardTitle>
          <CardDescription>내가 작성한 진료기록</CardDescription>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={() => void load()} disabled={loading} title="새로고침">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && records.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">저장된 진료 기록이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.recordId} className="p-4 border rounded-lg space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{nameMap.get(r.patientId) || `환자 #${r.patientId}`}</span>
                    <Badge variant="secondary" className="text-xs">
                      #{r.recordId}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm">
                  <span className="font-medium text-foreground">진단: </span>
                  {r.diagnosis || "—"}
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.treatmentNotes || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
