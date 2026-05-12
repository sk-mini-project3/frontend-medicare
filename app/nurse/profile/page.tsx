"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/hooks/use-auth-store"
import { NurseHeader } from "@/components/nurse/nurse-header"
import { ProfileForm } from "@/components/shared/profile-form"
import { Loader2 } from "lucide-react"

export default function NurseProfilePage() {
  const { user } = useAuthStore()
  const [currentView, setCurrentView] = useState<"reception" | "emr" | "prescription">("reception")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setIsLoading(false)
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NurseHeader currentView={currentView} onViewChange={setCurrentView} />
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">내 정보</h1>
          <ProfileForm
            key={user.id}
            userRole="nurse"
            initialData={{
              name: user.name,
              email: user.email,
              phone: user.phone ?? "",
              department: "",
              staffId: user.id,
            }}
          />
        </div>
      </main>
    </div>
  )
}
