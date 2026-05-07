"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface Patient {
  id: string
  name: string
  birthDate: string
  gender: string
  phone: string
  lastVisit: string
  status: "입원" | "외래" | "퇴원"
}

const mockPatients: Patient[] = [
  { id: "P-2024-001", name: "김영희", birthDate: "1985-03-15", gender: "여", phone: "010-1234-5678", lastVisit: "2024-01-15", status: "외래" },
  { id: "P-2024-002", name: "이철수", birthDate: "1972-08-22", gender: "남", phone: "010-2345-6789", lastVisit: "2024-01-14", status: "입원" },
  { id: "P-2024-003", name: "박지민", birthDate: "1990-12-01", gender: "여", phone: "010-3456-7890", lastVisit: "2024-01-13", status: "외래" },
  { id: "P-2024-004", name: "최민수", birthDate: "1968-05-10", gender: "남", phone: "010-4567-8901", lastVisit: "2024-01-12", status: "퇴원" },
  { id: "P-2024-005", name: "정수연", birthDate: "1995-07-28", gender: "여", phone: "010-5678-9012", lastVisit: "2024-01-11", status: "입원" },
]

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void
  selectedPatientId?: string
}

export function PatientSearch({ onSelectPatient, selectedPatientId }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [patients] = useState<Patient[]>(mockPatients)

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.includes(searchQuery) ||
      patient.id.includes(searchQuery) ||
      patient.phone.includes(searchQuery)
  )

  const getStatusColor = (status: Patient["status"]) => {
    switch (status) {
      case "입원":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "외래":
        return "bg-green-100 text-green-800 border-green-200"
      case "퇴원":
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">환자 조회</CardTitle>
        <CardDescription>환자명, 환자번호, 연락처로 검색하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="환자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors hover:bg-secondary/50",
                selectedPatientId === patient.id && "bg-primary/5 border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{patient.name}</span>
                      <span className="text-xs text-muted-foreground">({patient.gender})</span>
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(patient.status))}>
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{patient.id}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {patient.birthDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground pl-13">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {patient.phone}
                </span>
                <span>최근 방문: {patient.lastVisit}</span>
              </div>
            </button>
          ))}
          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export type { Patient }
