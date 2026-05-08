"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  role: string
}

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        })

        if (!res.ok) {
          router.replace("/login")
          return null
        }

        const data = await res.json()

        if (data.role !== "DOCTOR") {
          router.replace("/403")
          return
        }

        setUser(data)
      } catch (err) {
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}