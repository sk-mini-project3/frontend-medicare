"use client"

import { useState, useEffect } from "react"
import { PatientHeader } from "@/components/patient/patient-header"
import { useAuthStore } from "@/hooks/use-auth-store"
import { ReservationService, Reservation, ReservationStatus } from "@/services/reservation.service"
import { toast } from "sonner"
import { Loader2, Calendar, Clock, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AppointmentsPage() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAppointments = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await ReservationService.getMyReservations()
      setAppointments(data)
    } catch (error) {
      toast.error("예약 정보를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.WAITING:
        return { label: "대기 중", color: "bg-yellow-100 text-yellow-800" }
      case ReservationStatus.NURSE_APPROVED:
        return { label: "승인됨", color: "bg-blue-100 text-blue-800" }
      case ReservationStatus.COMPLETED:
        return { label: "완료", color: "bg-green-100 text-green-800" }
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" }
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patientName={user.name} patientId={user.id} />

      <main className="container px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">예약 관리</h1>
            <p className="text-muted-foreground mt-2">
              귀하의 의료 예약 내역을 확인하세요
            </p>
          </div>

          {appointments.length === 0 ? (
            <Card>
              <CardContent className="pt-8">
                <p className="text-center text-muted-foreground py-8">
                  예약 내역이 없습니다
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const status = getStatusLabel(appointment.status as ReservationStatus)
                const appointmentDate = new Date(appointment.reservationDate)
                return (
                  <Card key={appointment.reservationId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            예약 #{appointment.reservationId}
                          </CardTitle>
                          <CardDescription>
                            의사 ID: {appointment.doctorId}
                          </CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{appointmentDate.toLocaleString("ko-KR")}</span>
                        </div>
                        {appointment.symptoms && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>증상: {appointment.symptoms}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
