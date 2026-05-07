import React from "react"
import { PatientHeader } from "@/components/patient/patient-header"
import { SettingsForm } from "@/components/shared/settings-form"

export default function PatientSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patientName="김환자" patientId="P-2024-001" />
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">설정</h1>
          <SettingsForm userRole="patient" />
        </div>
      </main>
    </div>
  )
}
