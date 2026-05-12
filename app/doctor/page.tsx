"use client"

import { useState } from "react"
import { DoctorHeader } from "@/components/doctor/doctor-header"
import { PatientSearch, type Patient } from "@/components/doctor/patient-search"
import { PatientEMR } from "@/components/doctor/patient-emr"
import { PrescriptionForm } from "@/components/doctor/prescription-form"
import { NursePrescriptionApproval } from "@/components/doctor/nurse-prescription-approval"
import { DoctorPrescriptionHistory } from "@/components/doctor/doctor-prescription-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, ClipboardList, Activity } from "lucide-react"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useDoctorDashboardStats } from "@/hooks/use-doctor-dashboard-stats"

export default function DoctorPage() {
  const { user } = useAuthStore()
  const { stats, doctorId } = useDoctorDashboardStats()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState("patients")

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DoctorHeader
        doctorName={user.name}
        doctorId={user.id}
        pendingApprovals={stats.pendingApprovals}
      />

      <main className="container mx-auto px-4 py-6 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPatients}</p>
                  <p className="text-xs text-muted-foreground">등록 환자 (상세)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <ClipboardList className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                  <p className="text-xs text-muted-foreground">처방 승인 대기</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayMedicalRecords}</p>
                  <p className="text-xs text-muted-foreground">오늘 진료 기록</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMedicalRecords}</p>
                  <p className="text-xs text-muted-foreground">내 진료 기록 합계</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="patients">환자 조회 / EMR</TabsTrigger>
            <TabsTrigger value="prescriptions" className="relative">
              처방 관리
              {stats.pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
                  {stats.pendingApprovals}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <PatientSearch onSelectPatient={setSelectedPatient} selectedPatientId={selectedPatient?.id} />
              </div>

              <div className="lg:col-span-8">
                {selectedPatient ? (
                  <div className="space-y-6">
                    <PatientEMR patient={selectedPatient} />
                    <PrescriptionForm patient={selectedPatient} />
                  </div>
                ) : (
                  <Card className="h-full min-h-[500px] flex items-center justify-center">
                    <CardContent className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <CardTitle className="text-lg mb-2">환자를 선택하세요</CardTitle>
                      <CardDescription>
                        왼쪽 목록에서 환자를 선택하면 EMR 정보와 처방 기능이 표시됩니다
                      </CardDescription>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NursePrescriptionApproval />

              <DoctorPrescriptionHistory doctorId={doctorId} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
