"use client"

import { useState, useEffect } from "react"
import { PatientHeader } from "@/components/patient/patient-header"
import { useAuthStore } from "@/hooks/use-auth-store"
import { PrescriptionService, Prescription, PrescriptionStatus } from "@/services/prescription.service"
import { toast } from "sonner"
import { Loader2, Pill, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrescriptionsPage() {
  const { user } = useAuthStore()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPrescriptions = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await PrescriptionService.getMyPrescriptions()
      setPrescriptions(data)
    } catch (error) {
      toast.error("처방전 정보를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [user])

  const getStatusLabel = (status: PrescriptionStatus) => {
    switch (status) {
      case PrescriptionStatus.PENDING:
        return { label: "대기 중", color: "bg-yellow-100 text-yellow-800" }
      case PrescriptionStatus.APPROVED:
        return { label: "승인됨", color: "bg-green-100 text-green-800" }
      case PrescriptionStatus.REJECTED:
        return { label: "반려됨", color: "bg-red-100 text-red-800" }
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" }
    }
  }

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
            <h1 className="text-3xl font-bold">처방전</h1>
            <p className="text-muted-foreground mt-2">
              귀하의 처방전 내역을 확인하세요
            </p>
          </div>

          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="pt-8">
                <p className="text-center text-muted-foreground py-8">
                  처방전 내역이 없습니다
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => {
                const status = getStatusLabel(prescription.status as PrescriptionStatus)
                const createdDate = new Date(prescription.createdAt)
                return (
                  <Card key={prescription.prescriptionId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-primary" />
                            처방전 #{prescription.prescriptionId}
                          </CardTitle>
                          <CardDescription>
                            의사 ID: {prescription.doctorId}
                          </CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">약물명</p>
                            <p className="font-medium">{prescription.medication}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">용량</p>
                            <p className="font-medium">{prescription.dosage}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          발급일: {createdDate.toLocaleString("ko-KR")}
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
