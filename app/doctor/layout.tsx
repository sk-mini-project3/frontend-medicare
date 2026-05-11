"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/hooks/use-auth-store"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, fetchMe, isLoading, isHydrated } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await fetchMe()
      
      if (!userData) {
        router.replace("/login")
        return
      }

      if (userData.role !== "DOCTOR") {
        router.replace("/403")
      }
    }

    if (isHydrated) {
      checkAuth()
    }
  }, [fetchMe, router, isHydrated])

  if (!isHydrated || (isLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
