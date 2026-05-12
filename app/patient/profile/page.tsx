"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/hooks/use-auth-store"
import { PatientHeader } from "@/components/patient/patient-header"
import { ProfileForm } from "@/components/shared/profile-form"
import { Loader2 } from "lucide-react"
import { PatientService, type MyPatientProfileDto } from "@/services/patient.service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function readLocalPatientHealth(email: string): {
  bloodType: string
  insurance: string
  allergies: string
} {
  if (typeof window === "undefined") {
    return { bloodType: "", insurance: "", allergies: "" }
  }
  const norm = (s: string) => s.trim().toLowerCase()
  try {
    const raw = localStorage.getItem("patientInfo")
    if (!raw) return { bloodType: "", insurance: "", allergies: "" }
    const parsed = JSON.parse(raw) as {
      email?: string
      bloodType?: string
      insurance?: string
      allergies?: string
    }
    if (parsed.email && email && norm(parsed.email) !== norm(email)) {
      return { bloodType: "", insurance: "", allergies: "" }
    }
    return {
      bloodType: parsed.bloodType ?? "",
      insurance: parsed.insurance ?? "",
      allergies: parsed.allergies ?? "",
    }
  } catch {
    return { bloodType: "", insurance: "", allergies: "" }
  }
}

function nonEmpty(s: string | null | undefined): string | undefined {
  if (s == null) return undefined
  const t = String(s).trim()
  return t === "" ? undefined : t
}

export default function PatientProfilePage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<MyPatientProfileDto | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [localHealth, setLocalHealth] = useState({
    bloodType: "",
    insurance: "",
    allergies: "",
  })

  useEffect(() => {
    if (!user?.email) return
    setLocalHealth(readLocalPatientHealth(user.email))
  }, [user?.email])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    ;(async () => {
      setLoadError(null)
      try {
        const data = await PatientService.getMyProfile()
        if (!cancelled) setProfile(data)
      } catch (e: unknown) {
        if (!cancelled) {
          const msg =
            e && typeof e === "object" && "message" in e
              ? String((e as { message?: string }).message)
              : "프로필을 불러오지 못했습니다."
          setLoadError(msg)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  const formInitial = useMemo(() => {
    if (!user) return null
    const local = localHealth
    return {
      name: profile?.name ?? user.name,
      email: profile?.email ?? user.email,
      phone: profile?.phone ?? "",
      bloodType: nonEmpty(profile?.bloodType) ?? local.bloodType ?? "",
      insurance: nonEmpty(profile?.insuranceInfo) ?? local.insurance ?? "",
      allergies: nonEmpty(profile?.allergies) ?? local.allergies ?? "",
    }
  }, [user, profile, localHealth])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isLoading || !formInitial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const headerName = profile?.name?.trim() || user.name

  const hasServerHealth =
    !!profile &&
    Boolean(
      nonEmpty(profile.bloodType) ||
        nonEmpty(profile.insuranceInfo) ||
        nonEmpty(profile.allergies)
    )

  const usedLocalHealthOnly =
    !!profile &&
    !hasServerHealth &&
    Boolean(localHealth.bloodType || localHealth.insurance || localHealth.allergies)

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patientName={headerName} patientId={user.id} />
      <main className="container py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">내 정보</h1>
          {usedLocalHealthOnly && (
            <p className="text-sm text-muted-foreground mb-4">
              건강 정보는 아직 병원 DB에 없어, 이 브라우저에만 저장된 회원가입 시 입력값을 보여줍니다. 다른 기기나
              시크릿 창에서는 비어 있을 수 있습니다.
            </p>
          )}
          {profile && !hasServerHealth && !usedLocalHealthOnly && (
            <p className="text-sm text-muted-foreground mb-4">
              건강 정보는 병원에서 환자 접수가 등록된 뒤 서버에 저장되면 여기에 표시됩니다. 가입 직후이거나 접수
              전이면 비어 있을 수 있습니다.
            </p>
          )}
          {loadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>서버 연동</AlertTitle>
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}
          <ProfileForm
            key={`${formInitial.email}-${formInitial.bloodType}-${formInitial.insurance}-${formInitial.allergies}`}
            userRole="patient"
            initialData={formInitial}
          />
        </div>
      </main>
    </div>
  )
}
