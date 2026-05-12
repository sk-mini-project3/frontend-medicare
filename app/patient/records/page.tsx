"use client"

import { useState, useEffect } from "react"
import { PatientHeader } from "@/components/patient/patient-header"
import { useAuthStore } from "@/hooks/use-auth-store"
import { MedicalRecordService, MedicalRecord } from "@/services/medical-record.service"
import { toast } from "sonner"
import { Loader2, FileText, Calendar, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecordsPage() {
  const { user } = useAuthStore()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRecords = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await MedicalRecordService.getMyRecords()
      setRecords(data)
    } catch (error) {
      toast.error("진료 기록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [user])

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patientName={user.name} patientId={user.id} />

      <main className="container px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">진료 기록</h1>
            <p className="text-muted-foreground mt-2">
              귀하의 진료 기록을 확인하세요
            </p>
          </div>

          {records.length === 0 ? (
            <Card>
              <CardContent className="pt-8">
                <p className="text-center text-muted-foreground py-8">
                  진료 기록이 없습니다
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                const createdDate = new Date(record.createdAt)
                return (
                  <Card key={record.recordId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            진료 기록 #{record.recordId}
                          </CardTitle>
                          <CardDescription>
                            의사 ID: {record.doctorId}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">진단명</p>
                          <p className="text-base">{record.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">치료 내용</p>
                          <p className="text-base">{record.treatmentNotes}</p>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>작성일: {createdDate.toLocaleString("ko-KR")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>수정일: {new Date(record.updatedAt).toLocaleString("ko-KR")}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
