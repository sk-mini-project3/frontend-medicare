import React, { useState } from "react"
import { NurseHeader } from "@/components/nurse/nurse-header"
import { SettingsForm } from "@/components/shared/settings-form"

export default function NurseSettingsPage() {
  const [currentView, setCurrentView] = useState<"reception" | "emr" | "prescription">("reception")

  return (
    <div className="min-h-screen bg-background">
      <NurseHeader currentView={currentView} onViewChange={setCurrentView} />
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">설정</h1>
          <SettingsForm userRole="nurse" />
        </div>
      </main>
    </div>
  )
}
