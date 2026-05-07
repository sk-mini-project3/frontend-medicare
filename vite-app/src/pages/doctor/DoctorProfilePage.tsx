import React from "react"
import { DoctorHeader } from "@/components/doctor/doctor-header"
import { ProfileForm } from "@/components/shared/profile-form"

export default function DoctorProfilePage() {
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
          <h1 className="text-2xl font-bold mb-6">내 정보</h1>
          <ProfileForm
            userRole="doctor"
            initialData={{
              name: "김의사",
              email: "doctor@medicare.com",
              phone: "010-2345-6789",
              department: "내과",
              staffId: "D-2024-001",
            }}
          />
        </div>
      </main>
    </div>
  )
}
