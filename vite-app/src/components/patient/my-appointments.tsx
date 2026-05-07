"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarCheck, Clock, User, Building2, X } from "lucide-react"

interface Appointment {
  id: number
  date: Date
  time: string
  department: string
  doctor: string
  status: "confirmed" | "pending" | "completed"
}

interface MyAppointmentsProps {
  appointments: Appointment[]
  onCancelAppointment: (id: number) => void
}

const statusConfig = {
  confirmed: { label: "확정", variant: "default" as const, className: "bg-green-100 text-green-800 hover:bg-green-100" },
  pending: { label: "대기중", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  completed: { label: "완료", variant: "outline" as const, className: "bg-muted text-muted-foreground" },
}

export function MyAppointments({ appointments, onCancelAppointment }: MyAppointmentsProps) {
  const upcomingAppointments = appointments
    .filter(apt => apt.status !== "completed")
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          나의 예약
        </CardTitle>
        <CardDescription>예정된 진료 예약을 확인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>예정된 예약이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary">
                    <span className="text-lg font-bold">
                      {appointment.date.getDate()}
                    </span>
                    <span className="text-xs">
                      {appointment.date.toLocaleDateString("ko-KR", { month: "short" })}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig[appointment.status].className}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                      <span className="font-medium">{appointment.department}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {appointment.doctor}
                      </span>
                    </div>
                  </div>
                </div>
                {appointment.status !== "completed" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onCancelAppointment(appointment.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">예약 취소</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
