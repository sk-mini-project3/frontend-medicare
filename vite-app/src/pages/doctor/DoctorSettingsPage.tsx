import React from "react"
import { DoctorHeader } from "@/components/doctor/doctor-header"
import { SettingsForm } from "@/components/shared/settings-form"

export default function DoctorSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DoctorHeader 
        doctorName="김의사" 
        doctorId="D-2024-001" 
        department="내과"
        pendingApprovals={3}
      />
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">설정</h1>
          <SettingsForm userRole="doctor" />
        </div>
      </main>
    </div>
  )
}
