import React from "react"
import { PatientHeader } from "@/components/patient/patient-header"
import { ProfileForm } from "@/components/shared/profile-form"

export default function PatientProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patientName="김환자" patientId="P-2024-001" />
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">내 정보</h1>
          <ProfileForm
            userRole="patient"
            initialData={{
              name: "김환자",
              email: "patient@example.com",
              phone: "010-1234-5678",
              bloodType: "A+",
              insurance: "national",
              allergies: "페니실린",
            }}
          />
        </div>
      </main>
    </div>
  )
}
