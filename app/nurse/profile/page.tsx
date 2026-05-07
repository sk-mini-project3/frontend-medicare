"use client"

import { useState } from "react"
import { NurseHeader } from "@/components/nurse/nurse-header"
import { ProfileForm } from "@/components/shared/profile-form"

export default function NurseProfilePage() {
  const [currentView, setCurrentView] = useState<"reception" | "emr" | "prescription">("reception")

  return (
    <div className="min-h-screen bg-background">
      <NurseHeader currentView={currentView} onViewChange={setCurrentView} />
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">내 정보</h1>
          <ProfileForm
            userRole="nurse"
            initialData={{
              name: "박간호사",
              email: "nurse@medicare.com",
              phone: "010-3456-7890",
              department: "내과 병동",
              staffId: "N-2024-001",
            }}
          />
        </div>
      </main>
    </div>
  )
}
