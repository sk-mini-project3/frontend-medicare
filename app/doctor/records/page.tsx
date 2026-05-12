"use client"

import { DoctorHeader } from "@/components/doctor/doctor-header"
import { DoctorMedicalRecordsList } from "@/components/doctor/doctor-medical-records-list"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useDoctorDashboardStats } from "@/hooks/use-doctor-dashboard-stats"

export default function DoctorRecordsPage() {
  const { user } = useAuthStore()
  const { stats, doctorId } = useDoctorDashboardStats()

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DoctorHeader
        doctorName={user.name}
        doctorId={user.id}
        pendingApprovals={stats.pendingApprovals}
      />
      <main className="container mx-auto px-4 py-6 md:px-6 max-w-4xl">
        <DoctorMedicalRecordsList doctorId={doctorId} />
      </main>
    </div>
  )
}
