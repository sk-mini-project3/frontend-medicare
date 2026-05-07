"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarPlus, Clock } from "lucide-react"
import { ko } from "date-fns/locale"

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
]

const departments = [
  { id: 1, name: "내과", doctor: "김영수 전문의" },
  { id: 2, name: "외과", doctor: "이정민 전문의" },
  { id: 3, name: "피부과", doctor: "박서연 전문의" },
  { id: 4, name: "정형외과", doctor: "최현우 전문의" },
]

interface Appointment {
  id: number
  date: Date
  time: string
  department: string
  doctor: string
  status: "confirmed" | "pending" | "completed"
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
  onAddAppointment: (appointment: Omit<Appointment, "id" | "status">) => void
}

export function AppointmentCalendar({ appointments, onAddAppointment }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<typeof departments[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const appointmentDates = appointments.map(apt => apt.date.toDateString())

  const handleBookAppointment = () => {
    if (selectedDate && selectedTime && selectedDepartment) {
      onAddAppointment({
        date: selectedDate,
        time: selectedTime,
        department: selectedDepartment.name,
        doctor: selectedDepartment.doctor,
      })
      setSelectedTime(null)
      setSelectedDepartment(null)
      setIsDialogOpen(false)
    }
  }

  const isTimeSlotBooked = (date: Date, time: string) => {
    return appointments.some(
      apt => apt.date.toDateString() === date.toDateString() && apt.time === time
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
              예약하기
            </CardTitle>
            <CardDescription>원하는 날짜와 시간을 선택하세요</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>새 예약</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>진료 예약</DialogTitle>
                <DialogDescription>
                  진료과와 시간을 선택해주세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">진료과 선택</label>
                  <div className="grid grid-cols-2 gap-2">
                    {departments.map((dept) => (
                      <Button
                        key={dept.id}
                        variant={selectedDepartment?.id === dept.id ? "default" : "outline"}
                        className="h-auto py-3 flex flex-col items-start"
                        onClick={() => setSelectedDepartment(dept)}
                      >
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-xs text-muted-foreground">{dept.doctor}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    시간 선택 {selectedDate && `(${selectedDate.toLocaleDateString("ko-KR")})`}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => {
                      const isBooked = selectedDate ? isTimeSlotBooked(selectedDate, time) : false
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          disabled={isBooked}
                          onClick={() => setSelectedTime(time)}
                          className={isBooked ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {time}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  disabled={!selectedDate || !selectedTime || !selectedDepartment}
                  onClick={handleBookAppointment}
                >
                  예약 확정
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ko}
          className="rounded-md border"
          modifiers={{
            booked: (date) => appointmentDates.includes(date.toDateString())
          }}
          modifiersClassNames={{
            booked: "bg-primary/20 text-primary font-semibold"
          }}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
        {selectedDate && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              선택된 날짜: {selectedDate.toLocaleDateString("ko-KR", { 
                year: "numeric", 
                month: "long", 
                day: "numeric",
                weekday: "long"
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
