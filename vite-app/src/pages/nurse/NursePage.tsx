import React, { useState } from "react"
import { NurseHeader } from "@/components/nurse/nurse-header"
import { PatientReception } from "@/components/nurse/patient-reception"
import { NursePatientLookup, type Patient } from "@/components/nurse/nurse-patient-lookup"
import { NursePrescriptionRequest } from "@/components/nurse/nurse-prescription-request"

export default function NursePage() {
  const [currentView, setCurrentView] = useState<"reception" | "emr" | "prescription">("reception")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const handleViewChange = (view: "reception" | "emr" | "prescription") => {
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen bg-background">
      <NurseHeader currentView={currentView} onViewChange={handleViewChange} />
      
      <main className="container py-6">
        {currentView === "reception" && (
          <PatientReception />
        )}

        {currentView === "emr" && (
          <NursePatientLookup 
            onSelectPatient={handleSelectPatient}
            selectedPatient={selectedPatient}
          />
        )}

        {currentView === "prescription" && (
          <NursePrescriptionRequest patient={selectedPatient} />
        )}
      </main>
    </div>
  )
}
