"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Search, 
  UserPlus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ReservationService, ReservationStatus, Reservation } from "@/services/reservation.service"
import { PatientService } from "@/services/patient.service"
import { toast } from "sonner"

const DOCTOR_LABELS: Record<number, string> = {
  1: "김영수 전문의",
  2: "박의사",
  3: "이정민 전문의",
}

function getDoctorLabel(doctorId: number): string {
  return DOCTOR_LABELS[doctorId] ?? `의사 #${doctorId}`
}

// 프론트엔드 UI용 타입
interface Appointment extends Reservation {
  patientName?: string // 백엔드 응답에 포함되지 않을 수 있으므로 optional
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
]

const departments = [
  { value: "internal", label: "내과" },
  { value: "surgery", label: "외과" },
  { value: "orthopedics", label: "정형외과" },
  { value: "pediatrics", label: "소아과" },
  { value: "dermatology", label: "피부과" },
]

const doctors = [
  { value: "1", label: "김의사", department: "internal" },
  { value: "2", label: "박의사", department: "internal" },
  { value: "3", label: "이의사", department: "surgery" },
]

export function PatientReception() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    date: new Date(),
    time: "",
    doctor: "",
    reason: "",
  })

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const [data, patientRows] = await Promise.all([
        ReservationService.getAll({ date: dateStr }),
        PatientService.getAll().catch(() => [] as { userId: number; name?: string }[]),
      ])
      const nameByPatientId = new Map<number, string>()
      for (const row of patientRows) {
        const n = row.name?.trim()
        if (n) nameByPatientId.set(row.userId, n)
      }
      setAppointments(
        data.map((a) => ({
          ...a,
          patientName: a.patientName?.trim() || nameByPatientId.get(a.patientId) || undefined,
        }))
      )
    } catch (error) {
      toast.error("예약 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate])

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patientId.toString().includes(searchQuery) ||
      apt.symptoms?.includes(searchQuery)
  )

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.WAITING:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">예약대기</Badge>
      case ReservationStatus.NURSE_APPROVED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">접수완료</Badge>
      case ReservationStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">진료완료</Badge>
    }
  }

  const handleStatusChange = async (id: number, newStatus: ReservationStatus) => {
    try {
      await ReservationService.updateStatus(id, newStatus)
      toast.success("상태가 변경되었습니다.")
      fetchAppointments()
    } catch (error) {
      toast.error("상태 변경에 실패했습니다.")
    }
  }

  const handleCreateAppointment = async () => {
    const { patientId, date, time, doctor, reason } = newAppointment
    if (!patientId.trim() || !time || !doctor) {
      toast.error("환자 ID, 시간, 담당의는 필수입니다.")
      return
    }
    try {
      const reservationDate = `${format(date, "yyyy-MM-dd")}T${time}:00`
      await ReservationService.create({
        patientId: parseInt(patientId, 10),
        doctorId: parseInt(doctor, 10),
        reservationDate,
        symptoms: reason.trim() || undefined,
      })
      toast.success("예약이 등록되었습니다.")
      setIsNewAppointmentOpen(false)
      fetchAppointments()
      setNewAppointment({
        patientId: "",
        date: new Date(),
        time: "",
        doctor: "",
        reason: "",
      })
    } catch (error) {
      toast.error("예약 등록에 실패했습니다.")
    }
  }

  const waitingCount = appointments.filter(a => a.status === ReservationStatus.WAITING).length
  const approvedCount = appointments.filter(a => a.status === ReservationStatus.NURSE_APPROVED).length
  const completedCount = appointments.filter(a => a.status === ReservationStatus.COMPLETED).length

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 예약</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">대기중</p>
                <p className="text-2xl font-bold text-yellow-600">{waitingCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">접수완료</p>
                <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">진료 완료</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>환자 접수 및 예약 관리</CardTitle>
              <CardDescription>오늘의 예약 환자를 관리하고 새 예약을 등록하세요</CardDescription>
            </div>
            <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  새 예약 등록
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>새 예약 등록</DialogTitle>
                  <DialogDescription>환자 정보와 예약 일정을 입력하세요</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>환자 번호(ID)</Label>
                    <Input
                      placeholder="환자 ID 입력"
                      value={newAppointment.patientId}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>예약 날짜</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(newAppointment.date, "PPP", { locale: ko })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newAppointment.date}
                            onSelect={(date) => date && setNewAppointment({ ...newAppointment, date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>예약 시간</Label>
                      <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, time: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="시간 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>담당의</Label>
                    <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, doctor: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="담당의 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doc) => (
                          <SelectItem key={doc.value} value={doc.value}>{doc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>내원 사유</Label>
                    <Textarea
                      placeholder="증상 또는 내원 목적을 입력하세요"
                      value={newAppointment.reason}
                      onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>취소</Button>
                  <Button onClick={handleCreateAppointment}>예약 등록</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="환자번호, 사유로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDate, "yyyy.MM.dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="waiting">예약대기</TabsTrigger>
              <TabsTrigger value="approved">접수완료</TabsTrigger>
              <TabsTrigger value="completed">진료완료</TabsTrigger>
            </TabsList>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-4">
                  <AppointmentList 
                    appointments={filteredAppointments} 
                    onStatusChange={handleStatusChange}
                    getStatusBadge={getStatusBadge}
                  />
                </TabsContent>
                <TabsContent value="waiting" className="mt-4">
                  <AppointmentList 
                    appointments={filteredAppointments.filter(a => a.status === ReservationStatus.WAITING)} 
                    onStatusChange={handleStatusChange}
                    getStatusBadge={getStatusBadge}
                  />
                </TabsContent>
                <TabsContent value="approved" className="mt-4">
                  <AppointmentList 
                    appointments={filteredAppointments.filter(a => a.status === ReservationStatus.NURSE_APPROVED)} 
                    onStatusChange={handleStatusChange}
                    getStatusBadge={getStatusBadge}
                  />
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                  <AppointmentList 
                    appointments={filteredAppointments.filter(a => a.status === ReservationStatus.COMPLETED)} 
                    onStatusChange={handleStatusChange}
                    getStatusBadge={getStatusBadge}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function AppointmentList({ 
  appointments, 
  onStatusChange,
  getStatusBadge 
}: { 
  appointments: Appointment[]
  onStatusChange: (id: number, status: ReservationStatus) => void
  getStatusBadge: (status: ReservationStatus) => React.ReactNode
}) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        예약 내역이 없습니다
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {appointments.map((apt) => {
        const when = new Date(apt.reservationDate)
        const whenLabel = Number.isNaN(when.getTime())
          ? String(apt.reservationDate)
          : when.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })
        const symptoms = apt.symptoms?.trim()
        const patientTitle = apt.patientName?.trim()
          ? apt.patientName.trim()
          : `환자 #${apt.patientId}`

        return (
        <div
          key={apt.reservationId}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{patientTitle}</span>
                <span className="text-xs text-muted-foreground">환자번호 {apt.patientId}</span>
                <span className="text-xs text-muted-foreground">예약 #{apt.reservationId}</span>
                {getStatusBadge(apt.status)}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  {whenLabel}
                </span>
                <span>담당: {getDoctorLabel(apt.doctorId)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground/80">사유·진료과:</span>{" "}
                {symptoms || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {apt.status === ReservationStatus.WAITING && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange(apt.reservationId, ReservationStatus.NURSE_APPROVED)}
              >
                접수 승인
              </Button>
            )}
            {apt.status === ReservationStatus.NURSE_APPROVED && (
              <Button 
                size="sm"
                onClick={() => onStatusChange(apt.reservationId, ReservationStatus.COMPLETED)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                진료 완료 처리
              </Button>
            )}
          </div>
        </div>
        )
      })}
    </div>
  )
}
