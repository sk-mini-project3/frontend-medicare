"use client"

import { useState, useEffect } from "react"
import { PatientHeader } from "@/components/patient/patient-header"
import { AppointmentCalendar } from "@/components/patient/appointment-calendar"
import { MyAppointments } from "@/components/patient/my-appointments"
import { PrescriptionCard } from "@/components/patient/prescription-card"
import { MedicationSummary } from "@/components/patient/medication-summary"
import { useAuthStore } from "@/hooks/use-auth-store"
import { ReservationService, Reservation, ReservationStatus } from "@/services/reservation.service"
import { PrescriptionService, Prescription } from "@/services/prescription.service"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

/** 예약 시 symptoms: "{진료과} 진료 - {전문의명}" 형태로 저장됨 */
function parseDepartmentAndDoctorFromSymptoms(
  symptoms: string | undefined,
  doctorId: number
): { department: string; doctor: string } {
  const trimmed = symptoms?.trim()
  if (!trimmed) {
    return { department: "진료과 미입력", doctor: `의사 ID: ${doctorId}` }
  }
  const m = trimmed.match(/^(.+?)\s+진료\s*-\s*(.+)$/)
  if (m) {
    return { department: m[1].trim(), doctor: m[2].trim() }
  }
  return { department: trimmed, doctor: `의사 ID: ${doctorId}` }
}

export default function PatientPage() {
  const { user, fetchMe, isHydrated } = useAuthStore()
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 데이터 조회 함수 (먼저 정의)
  const fetchData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [resData, preData] = await Promise.all([
        ReservationService.getMyReservations(),
        PrescriptionService.getMyPrescriptions()
      ])
      
      // 백엔드 데이터를 프론트엔드 UI 포맷으로 변환
      const mappedAppointments = resData.map((res: any) => {
        const dateObj = new Date(res.reservationDate)
        const hours = String(dateObj.getHours()).padStart(2, '0')
        const minutes = String(dateObj.getMinutes()).padStart(2, '0')
        const { department, doctor } = parseDepartmentAndDoctorFromSymptoms(
          res.symptoms,
          res.doctorId
        )
        return {
          id: res.reservationId,
          date: dateObj,
          time: `${hours}:${minutes}`,
          department,
          doctor,
          status: res.status === ReservationStatus.COMPLETED ? "completed" : 
                  res.status === ReservationStatus.NURSE_APPROVED ? "confirmed" : "pending"
        }
      })

      const mappedPrescriptions = preData.map((pre: any) => ({
        id: pre.prescriptionId,
        date: new Date(pre.createdAt),
        doctor: `의사 ID: ${pre.doctorId}`,
        department: "내과",
        diagnosis: "진단 정보(기록 조회 필요)",
        medications: [
          {
            name: pre.medication,
            type: "알약",
            dosage: pre.dosage,
            frequency: "기록 참조",
            timing: ["아침", "점심", "저녁"],
            instruction: "식후",
            duration: "기간 참조",
          }
        ]
      }))

      setAppointments(mappedAppointments)
      setPrescriptions(mappedPrescriptions)
    } catch (error) {
      toast.error("데이터를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // Hydration 완료 후 user 정보 갱신
  useEffect(() => {
    if (!isHydrated) {
      console.log("⏳ Hydration 대기 중...")
      return
    }

    console.log("✅ Hydration 완료. 현재 user:", user)

    const initializeUser = async () => {
      if (user?.id === "temp" || !user?.id) {
        console.log("📝 user.id가 temp이거나 없음. fetchMe() 호출...")
        const result = await fetchMe()
        console.log("📝 fetchMe() 결과:", result)
      }
    }
    
    initializeUser()
  }, [isHydrated, fetchMe])

  // user.id가 유효할 때만 fetchData 호출
  useEffect(() => {
    if (user && user.id && user.id !== "temp") {
      console.log("✅ user.id 유효함. fetchData() 호출:", user.id)
      fetchData()
    }
  }, [user?.id])

  const handleAddAppointment = async (newAppointment: {
    date: Date
    time: string
    department: string
    doctor: string
  }) => {
    if (!user) {
      console.error("❌ user 객체가 없음:", user)
      return
    }
    try {
      // reservationDate: ISO 8601 형식 "2026-05-12T14:30:00"
      const dateStr = newAppointment.date.toISOString().split('T')[0]  // "2026-05-12"
      const [hours, minutes] = newAppointment.time.split(':')  // "14:30" → ["14", "30"]
      const reservationDateTime = `${dateStr}T${hours}:${minutes}:00`  // "2026-05-12T14:30:00"
      
      // user.id 값 디버깅
      console.log("👤 user 객체:", JSON.stringify(user, null, 2))
      console.log("👤 user.id 값:", user.id)
      console.log("👤 user.id 타입:", typeof user.id)
      console.log("👤 parseInt(user.id) 결과:", parseInt(user.id))
      
      const patientId = parseInt(user.id)
      if (isNaN(patientId)) {
        console.error("❌ patientId NaN이 됨. user.id:", user.id)
      }
      
      const payload = {
        patientId: patientId,
        doctorId: 1,
        reservationDate: reservationDateTime,
        symptoms: `${newAppointment.department} 진료 - ${newAppointment.doctor}`
      }
      
      console.log("📤 예약 생성 요청:", JSON.stringify(payload, null, 2))
      
      const response = await ReservationService.create(payload)
      console.log("✅ 예약 생성 응답:", response)
      
      toast.success("예약이 신청되었습니다.")
      fetchData()
    } catch (error: any) {
      console.error("❌ 예약 생성 실패 - 전체 에러:", error)
      console.error("❌ 예약 생성 실패 - 응답:", error.response)
      console.error("❌ 예약 생성 실패 - 메시지:", error.message)
      toast.error(error.response?.data?.message || error.message || "예약 신청에 실패했습니다.")
    }
  }

  const handleCancelAppointment = async (id: number) => {
    // 백엔드 취소 API 미구현 시 프론트 처리 또는 알림
    toast.info("예약 취소 기능은 준비 중입니다.")
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentMedications = prescriptions.flatMap(p =>
    p.medications.map((m: any) => ({
      name: m.name,
      type: m.type,
      frequency: m.frequency,
      timing: m.timing,
      instruction: m.instruction,
    }))
  )

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patientName={user.name} patientId={user.id} />

      <main className="container px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">안녕하세요, {user.name}님</h1>
          <p className="text-muted-foreground mt-1">
            오늘도 건강한 하루 되세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AppointmentCalendar
              appointments={appointments}
              onAddAppointment={handleAddAppointment}
            />

            <MyAppointments
              appointments={appointments}
              onCancelAppointment={handleCancelAppointment}
            />
          </div>

          <div className="space-y-6">
            <PrescriptionCard prescriptions={prescriptions} />
            <MedicationSummary medications={currentMedications} />
          </div>
        </div>
      </main>
    </div>
  )
}
