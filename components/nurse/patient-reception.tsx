"use client"

import { useState } from "react"
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
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  phone: string
  date: string
  time: string
  department: string
  doctor: string
  reason: string
  status: "waiting" | "in-progress" | "completed" | "cancelled"
}

const mockAppointments: Appointment[] = [
  { id: "A-001", patientId: "P-2024-001", patientName: "김영희", phone: "010-1234-5678", date: "2024-01-15", time: "09:00", department: "내과", doctor: "김의사", reason: "정기 검진", status: "waiting" },
  { id: "A-002", patientId: "P-2024-002", patientName: "이철수", phone: "010-2345-6789", date: "2024-01-15", time: "09:30", department: "내과", doctor: "김의사", reason: "두통", status: "in-progress" },
  { id: "A-003", patientId: "P-2024-003", patientName: "박지민", phone: "010-3456-7890", date: "2024-01-15", time: "10:00", department: "내과", doctor: "박의사", reason: "감기 증상", status: "waiting" },
  { id: "A-004", patientId: "P-2024-004", patientName: "최민수", phone: "010-4567-8901", date: "2024-01-15", time: "10:30", department: "내과", doctor: "김의사", reason: "혈압 관리", status: "completed" },
  { id: "A-005", patientId: "P-2024-005", patientName: "정수연", phone: "010-5678-9012", date: "2024-01-15", time: "11:00", department: "내과", doctor: "박의사", reason: "어지러움", status: "cancelled" },
]

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
  { value: "kim", label: "김의사", department: "internal" },
  { value: "park", label: "박의사", department: "internal" },
  { value: "lee", label: "이의사", department: "surgery" },
]

export function PatientReception() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    phone: "",
    date: new Date(),
    time: "",
    department: "",
    doctor: "",
    reason: "",
  })

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patientName.includes(searchQuery) ||
      apt.patientId.includes(searchQuery) ||
      apt.phone.includes(searchQuery)
  )

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">대기중</Badge>
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">진료중</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">완료</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">취소</Badge>
    }
  }

  const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: newStatus } : apt
    ))
  }

  const handleCreateAppointment = () => {
    const newApt: Appointment = {
      id: `A-${Date.now()}`,
      patientId: `P-${Date.now()}`,
      patientName: newAppointment.patientName,
      phone: newAppointment.phone,
      date: format(newAppointment.date, "yyyy-MM-dd"),
      time: newAppointment.time,
      department: departments.find(d => d.value === newAppointment.department)?.label || "",
      doctor: doctors.find(d => d.value === newAppointment.doctor)?.label || "",
      reason: newAppointment.reason,
      status: "waiting",
    }
    setAppointments([newApt, ...appointments])
    setIsNewAppointmentOpen(false)
    setNewAppointment({
      patientName: "",
      phone: "",
      date: new Date(),
      time: "",
      department: "",
      doctor: "",
      reason: "",
    })
  }

  const waitingCount = appointments.filter(a => a.status === "waiting").length
  const inProgressCount = appointments.filter(a => a.status === "in-progress").length
  const completedCount = appointments.filter(a => a.status === "completed").length

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
                <p className="text-sm text-muted-foreground">진료중</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>환자명</Label>
                      <Input
                        placeholder="환자 이름"
                        value={newAppointment.patientName}
                        onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>연락처</Label>
                      <Input
                        placeholder="010-0000-0000"
                        value={newAppointment.phone}
                        onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })}
                      />
                    </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>진료과</Label>
                      <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, department: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="진료과 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>담당의</Label>
                      <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, doctor: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="담당의 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.filter(d => !newAppointment.department || d.department === newAppointment.department).map((doc) => (
                            <SelectItem key={doc.value} value={doc.value}>{doc.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                placeholder="환자명, 환자번호, 연락처로 검색..."
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
              <TabsTrigger value="waiting">대기중</TabsTrigger>
              <TabsTrigger value="in-progress">진료중</TabsTrigger>
              <TabsTrigger value="completed">완료</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <AppointmentList 
                appointments={filteredAppointments} 
                onStatusChange={handleStatusChange}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            <TabsContent value="waiting" className="mt-4">
              <AppointmentList 
                appointments={filteredAppointments.filter(a => a.status === "waiting")} 
                onStatusChange={handleStatusChange}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            <TabsContent value="in-progress" className="mt-4">
              <AppointmentList 
                appointments={filteredAppointments.filter(a => a.status === "in-progress")} 
                onStatusChange={handleStatusChange}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <AppointmentList 
                appointments={filteredAppointments.filter(a => a.status === "completed")} 
                onStatusChange={handleStatusChange}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
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
  onStatusChange: (id: string, status: Appointment["status"]) => void
  getStatusBadge: (status: Appointment["status"]) => React.ReactNode
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
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{apt.patientName}</span>
                <span className="text-xs text-muted-foreground">({apt.patientId})</span>
                {getStatusBadge(apt.status)}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {apt.time}
                </span>
                <span>{apt.department} | {apt.doctor}</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {apt.phone}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">사유: {apt.reason}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {apt.status === "waiting" && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusChange(apt.id, "in-progress")}
                >
                  접수
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => onStatusChange(apt.id, "cancelled")}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {apt.status === "in-progress" && (
              <Button 
                size="sm"
                onClick={() => onStatusChange(apt.id, "completed")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                완료
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
