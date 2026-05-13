"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar, Phone, Loader2, RefreshCw } from "lucide-react"
import { cn, isMeaningfulPatientGender } from "@/lib/utils"
import { PatientService } from "@/services/patient.service"
import { toast } from "sonner"

export type Patient = {
  userId: number
  id: string
  name: string
  birthDate: string
  gender: string
  phone: string
  lastVisit: string
  status: "입원" | "외래" | "퇴원"
}

function mapDtoToPatient(d: { userId: number; name: string; birthDate: string; gender: string; phone: string }): Patient {
  return {
    userId: d.userId,
    id: String(d.userId),
    name: d.name?.trim() || "(이름 없음)",
    birthDate: d.birthDate?.trim() || "—",
    gender: d.gender?.trim() || "—",
    phone: d.phone?.trim() || "—",
    lastVisit: "—",
    status: "외래",
  }
}

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void
  selectedPatientId?: string
}

export function PatientSearch({ onSelectPatient, selectedPatientId }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await PatientService.getAll()
      setPatients(list.map(mapDtoToPatient))
    } catch {
      toast.error("환자 목록을 불러오지 못했습니다.")
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

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
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">환자 조회</CardTitle>
          <CardDescription>이름·환자번호·연락처로 검색</CardDescription>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={() => void load()} disabled={isLoading} title="새로고침">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
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
          {isLoading && patients.length === 0 ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{patient.name}</span>
                        {isMeaningfulPatientGender(patient.gender) && (
                          <span className="text-xs text-muted-foreground">({patient.gender})</span>
                        )}
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(patient.status))}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>ID {patient.id}</span>
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
                </div>
              </button>
            ))
          )}
          {!isLoading && filteredPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {patients.length === 0 ? "등록된 환자가 없습니다." : "검색 결과가 없습니다"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
