"use client"

import { DoctorHeader } from "@/components/doctor/doctor-header"
import { NursePrescriptionApproval } from "@/components/doctor/nurse-prescription-approval"
import { DoctorPrescriptionHistory } from "@/components/doctor/doctor-prescription-history"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useDoctorDashboardStats } from "@/hooks/use-doctor-dashboard-stats"

export default function DoctorPrescriptionsPage() {
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
      <main className="container mx-auto px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NursePrescriptionApproval />
          <DoctorPrescriptionHistory doctorId={doctorId} />
        </div>
      </main>
    </div>
  )
}
