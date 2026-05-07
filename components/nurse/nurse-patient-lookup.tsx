"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  FileText, 
  TestTube, 
  Activity,
  Clipboard,
  AlertCircle
} from "lucide-react"
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

// 목업 EMR 데이터
const mockEMRData = {
  basicInfo: {
    address: "서울시 강남구 테헤란로 123",
    emergencyContact: "010-9999-8888 (배우자)",
    bloodType: "A+",
    allergies: ["페니실린", "아스피린"],
    insurance: "국민건강보험",
  },
  medicalHistory: {
    chiefComplaint: "두통 및 어지러움 증상으로 내원",
    presentIllness: "3일 전부터 시작된 두통이 점점 심해지고, 어지러움과 함께 구역감이 동반됨.",
    pastHistory: [
      { condition: "고혈압", diagnosedDate: "2020-05", status: "관리중" },
      { condition: "당뇨병 (Type 2)", diagnosedDate: "2021-08", status: "관리중" },
    ],
    familyHistory: "부: 고혈압, 모: 당뇨병",
    socialHistory: "비흡연, 주 1-2회 음주",
  },
  testResults: {
    bloodTests: [
      { name: "혈당 (공복)", value: "126", unit: "mg/dL", reference: "70-100", status: "high" },
      { name: "혈압", value: "145/92", unit: "mmHg", reference: "120/80", status: "high" },
    ],
    imagingResults: [
      { type: "Brain CT", date: "2024-01-10", result: "특이 소견 없음", status: "정상" },
    ],
  },
  nursingRecords: [
    {
      date: "2024-01-15 09:30",
      nurse: "이간호사",
      record: "V/S: BP 140/88, PR 72, BT 36.5. 환자 두통 호전됨.",
    },
    {
      date: "2024-01-10 14:20",
      nurse: "최간호사",
      record: "V/S: BP 148/95, PR 78, BT 36.7. CT 촬영 완료.",
    },
  ],
}

interface NursePatientLookupProps {
  onSelectPatient: (patient: Patient) => void
  selectedPatient: Patient | null
}

export function NursePatientLookup({ onSelectPatient, selectedPatient }: NursePatientLookupProps) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "high":
        return <Badge variant="destructive" className="text-xs">높음</Badge>
      case "low":
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">낮음</Badge>
      case "normal":
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">정상</Badge>
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 환자 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">환자 조회</CardTitle>
          <CardDescription>환자명, 환자번호, 연락처로 검색</CardDescription>
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

          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-4">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors hover:bg-secondary/50",
                    selectedPatient?.id === patient.id && "bg-primary/5 border-primary/30"
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
                  </div>
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* EMR 조회 (읽기 전용) */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          {selectedPatient ? (
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {selectedPatient.name}
                  <Badge variant="secondary">{selectedPatient.gender}</Badge>
                  <Badge variant="outline" className={cn("text-xs", getStatusColor(selectedPatient.status))}>
                    {selectedPatient.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  환자번호: {selectedPatient.id} | 생년월일: {selectedPatient.birthDate}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                읽기 전용
              </Badge>
            </div>
          ) : (
            <div>
              <CardTitle>환자 EMR</CardTitle>
              <CardDescription>환자를 선택하면 EMR 정보가 표시됩니다</CardDescription>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!selectedPatient ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <User className="h-16 w-16 mb-4 text-muted-foreground/30" />
              <p>왼쪽 목록에서 환자를 선택해주세요</p>
            </div>
          ) : (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic" className="text-xs">기본정보</TabsTrigger>
                <TabsTrigger value="history" className="text-xs">병력</TabsTrigger>
                <TabsTrigger value="tests" className="text-xs">검사결과</TabsTrigger>
                <TabsTrigger value="nursing" className="text-xs">간호기록</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[420px] pr-4">
                {/* 기본 정보 탭 */}
                <TabsContent value="basic" className="mt-0 space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">환자 정보</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.name} ({selectedPatient.gender}) | {selectedPatient.birthDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">연락처</p>
                        <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                        <p className="text-sm text-muted-foreground">비상연락처: {mockEMRData.basicInfo.emergencyContact}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">주소</p>
                        <p className="text-sm text-muted-foreground">{mockEMRData.basicInfo.address}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">혈액형</p>
                        <p className="text-sm text-muted-foreground">{mockEMRData.basicInfo.bloodType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">보험</p>
                        <p className="text-sm text-muted-foreground">{mockEMRData.basicInfo.insurance}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">알레르기</p>
                      <div className="flex flex-wrap gap-2">
                        {mockEMRData.basicInfo.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 병력 탭 */}
                <TabsContent value="history" className="mt-0 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        주소 (Chief Complaint)
                      </h4>
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                        {mockEMRData.medicalHistory.chiefComplaint}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">현병력 (Present Illness)</h4>
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                        {mockEMRData.medicalHistory.presentIllness}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">과거력 (Past History)</h4>
                      <div className="space-y-2">
                        {mockEMRData.medicalHistory.pastHistory.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                            <div>
                              <span className="text-sm font-medium">{item.condition}</span>
                              <span className="text-xs text-muted-foreground ml-2">({item.diagnosedDate})</span>
                            </div>
                            <Badge variant={item.status === "관리중" ? "default" : "secondary"} className="text-xs">
                              {item.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">가족력</h4>
                        <p className="text-sm text-muted-foreground">{mockEMRData.medicalHistory.familyHistory}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">사회력</h4>
                        <p className="text-sm text-muted-foreground">{mockEMRData.medicalHistory.socialHistory}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 검사 결과 탭 */}
                <TabsContent value="tests" className="mt-0 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <TestTube className="h-4 w-4" />
                      혈액 검사
                    </h4>
                    <div className="space-y-2">
                      {mockEMRData.testResults.bloodTests.map((test, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                          <span className="text-sm">{test.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{test.value} {test.unit}</span>
                            <span className="text-xs text-muted-foreground">({test.reference})</span>
                            {getStatusBadge(test.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4" />
                      영상 검사
                    </h4>
                    <div className="space-y-2">
                      {mockEMRData.testResults.imagingResults.map((test, index) => (
                        <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{test.type}</span>
                            <Badge variant={test.status === "정상" ? "outline" : "secondary"} className="text-xs">
                              {test.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{test.date}</p>
                          <p className="text-sm mt-1">{test.result}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* 간호 기록 탭 */}
                <TabsContent value="nursing" className="mt-0 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Clipboard className="h-4 w-4" />
                      간호 기록
                    </h4>
                    <div className="space-y-3">
                      {mockEMRData.nursingRecords.map((record, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{record.date}</span>
                            <span className="text-xs text-muted-foreground">{record.nurse}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{record.record}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export type { Patient }
