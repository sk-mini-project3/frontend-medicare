import React, { useState } from "react"
import { PatientHeader } from "@/components/patient/patient-header"
import { AppointmentCalendar } from "@/components/patient/appointment-calendar"
import { MyAppointments } from "@/components/patient/my-appointments"
import { PrescriptionCard } from "@/components/patient/prescription-card"
import { MedicationSummary } from "@/components/patient/medication-summary"

// 샘플 데이터
const initialAppointments = [
  {
    id: 1,
    date: new Date(2026, 4, 10),
    time: "10:00",
    department: "내과",
    doctor: "김영수 전문의",
    status: "confirmed" as const,
  },
  {
    id: 2,
    date: new Date(2026, 4, 15),
    time: "14:30",
    department: "정형외과",
    doctor: "최현우 전문의",
    status: "pending" as const,
  },
]

const samplePrescriptions = [
  {
    id: 1,
    date: new Date(2026, 4, 1),
    doctor: "김영수 전문의",
    department: "내과",
    diagnosis: "급성 상기도 감염",
    medications: [
      {
        name: "타이레놀 정 500mg",
        type: "알약" as const,
        dosage: "1정",
        frequency: "하루 3회",
        timing: ["아침", "점심", "저녁"] as const,
        instruction: "식후" as const,
        duration: "5일",
        notes: "열이 38도 이상일 때만 복용",
      },
      {
        name: "씬지록스 가루",
        type: "가루약" as const,
        dosage: "1포",
        frequency: "하루 2회",
        timing: ["아침", "저녁"] as const,
        instruction: "식후" as const,
        duration: "7일",
      },
    ],
  },
  {
    id: 2,
    date: new Date(2026, 3, 25),
    doctor: "박서연 전문의",
    department: "피부과",
    diagnosis: "접촉성 피부염",
    medications: [
      {
        name: "더모베이트 연고",
        type: "연고" as const,
        dosage: "적당량",
        frequency: "하루 2회",
        timing: ["아침", "저녁"] as const,
        instruction: "식후" as const,
        duration: "14일",
        notes: "환부에 얇게 도포, 눈 주위 사용 금지",
      },
      {
        name: "지르텍 정 10mg",
        type: "알약" as const,
        dosage: "1정",
        frequency: "하루 1회",
        timing: ["저녁"] as const,
        instruction: "취침전" as const,
        duration: "7일",
        notes: "졸음이 올 수 있으니 운전 시 주의",
      },
    ],
  },
]

// 복용 요약용 데이터 추출
const currentMedications = samplePrescriptions.flatMap(p =>
  p.medications.map(m => ({
    name: m.name,
    type: m.type,
    frequency: m.frequency,
    timing: m.timing as ("아침" | "점심" | "저녁")[],
    instruction: m.instruction,
  }))
)

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [nextId, setNextId] = useState(3)

  const handleAddAppointment = (newAppointment: {
    date: Date
    time: string
    department: string
    doctor: string
  }) => {
    setAppointments([
      ...appointments,
      {
        ...newAppointment,
        id: nextId,
        status: "pending" as const,
      },
    ])
    setNextId(nextId + 1)
  }

  const handleCancelAppointment = (id: number) => {
    setAppointments(appointments.filter(apt => apt.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patientName="홍길동" patientId="P-2026-0001" />
      
      <main className="container px-4 md:px-6 py-6">
        {/* 환영 메시지 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            안녕하세요, 홍길동님
          </h1>
          <p className="text-muted-foreground mt-1">
            오늘도 건강한 하루 되세요
          </p>
        </div>

        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 예약 관련 */}
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

          {/* 오른쪽: 처방전 및 복용 요약 */}
          <div className="space-y-6">
            <PrescriptionCard prescriptions={samplePrescriptions} />
            <MedicationSummary medications={currentMedications} />
          </div>
        </div>
      </main>
    </div>
  )
}
