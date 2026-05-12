"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/hooks/use-auth-store"
import { DoctorHeader } from "@/components/doctor/doctor-header"
import { ProfileForm } from "@/components/shared/profile-form"
import { Loader2 } from "lucide-react"

export default function DoctorProfilePage() {
  const { user } = useAuthStore()
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
      <DoctorHeader 
        doctorName={user.name}
        doctorId={user.id}
        pendingApprovals={3}
      />
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">내 정보</h1>
          <ProfileForm
            key={user.id}
            userRole="doctor"
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
