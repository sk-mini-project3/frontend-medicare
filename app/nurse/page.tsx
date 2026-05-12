"use client"

import { useCallback, useState } from "react"
import { NurseHeader } from "@/components/nurse/nurse-header"
import { PatientReception } from "@/components/nurse/patient-reception"
import { NursePatientLookup, type Patient } from "@/components/nurse/nurse-patient-lookup"
import { NursePrescriptionRequest } from "@/components/nurse/nurse-prescription-request"

export default function NursePage() {
  const [currentView, setCurrentView] = useState<
    "reception" | "emr" | "prescription"
  >("reception")

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // 현재 화면 변경
  const handleViewChange = (view: "reception" | "emr" | "prescription") => {
    setCurrentView(view)
  }

  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <NurseHeader
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      <main className="container mx-auto px-4 py-6 md:px-6">

        {/* 접수 */}
        {currentView === "reception" && (
          <PatientReception />
        )}

        {/* EMR 조회 */}
        {currentView === "emr" && (
          <NursePatientLookup
            onSelectPatient={handleSelectPatient}
            selectedPatient={selectedPatient}
          />
        )}

        {/* 처방 요청 */}
        {currentView === "prescription" && (
          <NursePrescriptionRequest patient={selectedPatient} />
        )}

      </main>
    </div>
  )
}