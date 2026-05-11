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

export default function PatientPage() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [resData, preData] = await Promise.all([
        ReservationService.getMyReservations(),
        PrescriptionService.getMyPrescriptions()
      ])
      
      // 백엔드 데이터를 프론트엔드 UI 포맷으로 변환
      const mappedAppointments = resData.map(res => {
        const dateObj = new Date(res.reservationDate)
        return {
          id: res.reservationId,
          date: dateObj,
          time: format(dateObj, "HH:mm"),
          department: "내과", // 백엔드에 부서 정보 부재 시 기본값
          doctor: `의사 ID: ${res.doctorId}`,
          status: res.status === ReservationStatus.COMPLETED ? "completed" : 
                  res.status === ReservationStatus.NURSE_APPROVED ? "confirmed" : "pending"
        }
      })

      const mappedPrescriptions = preData.map(pre => ({
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

  useEffect(() => {
    fetchData()
  }, [user])

  const handleAddAppointment = async (newAppointment: {
    date: Date
    time: string
    department: string
    doctor: string
  }) => {
    if (!user) return
    try {
      await ReservationService.create({
        patientId: parseInt(user.id),
        doctorId: 1, // 테스트용 고정 ID
        reservationDate: newAppointment.date.toISOString().split('T')[0],
        reservationTime: newAppointment.time,
        reason: `${newAppointment.department} 진료 예약`
      })
      toast.success("예약이 신청되었습니다.")
      fetchData()
    } catch (error) {
      toast.error("예약 신청에 실패했습니다.")
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
