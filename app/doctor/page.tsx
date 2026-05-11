"use client"

import { useState } from "react"
import { DoctorHeader } from "@/components/doctor/doctor-header"
import { PatientSearch, type Patient } from "@/components/doctor/patient-search"
import { PatientEMR } from "@/components/doctor/patient-emr"
import { PrescriptionForm } from "@/components/doctor/prescription-form"
import { NursePrescriptionApproval } from "@/components/doctor/nurse-prescription-approval"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, ClipboardList, Activity } from "lucide-react"
import { useAuthStore } from "@/hooks/use-auth-store"

export default function DoctorPage() {
  const { user } = useAuthStore()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState("patients")

  // 통계 데이터 (실제 서비스에서는 API로 받아오게 됩니다)
  const stats = {
    todayPatients: 12,
    pendingApprovals: 3,
    completedConsults: 8,
    inpatients: 5,
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DoctorHeader
        doctorName={user.name}
        doctorId={user.id}
        department={user.department || "일반내과"}
        pendingApprovals={stats.pendingApprovals}
      />

      <main className="container mx-auto px-4 py-6 md:px-6">

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayPatients}</p>
                  <p className="text-xs text-muted-foreground">오늘 예약 환자</p>
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
                  <p className="text-xs text-muted-foreground">승인 대기</p>
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
                  <p className="text-2xl font-bold">{stats.completedConsults}</p>
                  <p className="text-xs text-muted-foreground">오늘 진료 완료</p>
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
                  <p className="text-2xl font-bold">{stats.inpatients}</p>
                  <p className="text-xs text-muted-foreground">담당 입원환자</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메인 탭 */}
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
                <PatientSearch
                  onSelectPatient={setSelectedPatient}
                  selectedPatientId={selectedPatient?.id}
                />
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">처방 이력</CardTitle>
                  <CardDescription>최근 발행한 처방전 내역</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {[
                      { patient: "박지민", date: "2024-01-15 11:30", meds: "타이레놀정, 오메프라졸캡슐" },
                      { patient: "김영희", date: "2024-01-15 10:15", meds: "아모잘탄정" },
                      { patient: "최민수", date: "2024-01-14 16:45", meds: "메트포르민정, 아스피린정" },
                      { patient: "이철수", date: "2024-01-14 14:20", meds: "프레드니솔론정" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.patient}</p>
                          <p className="text-sm text-muted-foreground">{item.meds}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
