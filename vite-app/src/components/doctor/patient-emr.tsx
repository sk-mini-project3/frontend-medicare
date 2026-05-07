"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Phone, MapPin, FileText, TestTube, Pill, Clipboard, Activity } from "lucide-react"
import type { Patient } from "./patient-search"

interface PatientEMRProps {
  patient: Patient
}

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
    presentIllness: "3일 전부터 시작된 두통이 점점 심해지고, 어지러움과 함께 구역감이 동반됨. 특별한 외상력은 없으며, 수면 부족과 스트레스가 원인으로 추정됨.",
    pastHistory: [
      { condition: "고혈압", diagnosedDate: "2020-05", status: "관리중" },
      { condition: "당뇨병 (Type 2)", diagnosedDate: "2021-08", status: "관리중" },
      { condition: "충수절제술", diagnosedDate: "2015-03", status: "완료" },
    ],
    familyHistory: "부: 고혈압, 모: 당뇨병",
    socialHistory: "비흡연, 주 1-2회 음주",
  },
  testResults: {
    bloodTests: [
      { name: "혈당 (공복)", value: "126", unit: "mg/dL", reference: "70-100", status: "high" },
      { name: "HbA1c", value: "7.2", unit: "%", reference: "4.0-5.6", status: "high" },
      { name: "총 콜레스테롤", value: "210", unit: "mg/dL", reference: "< 200", status: "high" },
      { name: "HDL 콜레스테롤", value: "45", unit: "mg/dL", reference: "> 40", status: "normal" },
      { name: "LDL 콜레스테롤", value: "130", unit: "mg/dL", reference: "< 130", status: "normal" },
      { name: "혈압", value: "145/92", unit: "mmHg", reference: "120/80", status: "high" },
    ],
    imagingResults: [
      { type: "Brain CT", date: "2024-01-10", result: "특이 소견 없음", status: "정상" },
      { type: "Chest X-ray", date: "2024-01-10", result: "심비대 경미하게 관찰됨", status: "주의" },
    ],
  },
  progressNotes: [
    {
      date: "2024-01-15",
      doctor: "김의사",
      note: "혈압 조절 위해 약물 용량 조절. 두통 증상 호전 추세. 1주 후 재진 예정.",
      type: "외래",
    },
    {
      date: "2024-01-10",
      doctor: "김의사",
      note: "두통 및 어지러움 주소로 내원. Brain CT 시행하였으나 특이 소견 없음. 혈압 상승 확인되어 약물 처방.",
      type: "외래",
    },
    {
      date: "2023-12-20",
      doctor: "박의사",
      note: "정기 검진. 당뇨 및 고혈압 관리 상태 양호. 생활습관 개선 권고.",
      type: "외래",
    },
  ],
  nursingRecords: [
    {
      date: "2024-01-15 09:30",
      nurse: "이간호사",
      record: "V/S: BP 140/88, PR 72, BT 36.5. 환자 두통 호전됨. 약물 복용 교육 완료.",
    },
    {
      date: "2024-01-10 14:20",
      nurse: "최간호사",
      record: "V/S: BP 148/95, PR 78, BT 36.7. CT 촬영 위해 영상의학과 이송. 금식 상태 확인.",
    },
  ],
  admissionHistory: [
    {
      admissionDate: "2023-06-15",
      dischargeDate: "2023-06-20",
      reason: "혈당 조절 불량",
      summary: "인슐린 용량 조절 및 식이 교육 후 퇴원",
    },
  ],
}

export function PatientEMR({ patient }: PatientEMRProps) {
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {patient.name}
              <Badge variant="secondary">{patient.gender}</Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              환자번호: {patient.id} | 생년월일: {patient.birthDate}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="basic" className="text-xs">기본정보</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">병력</TabsTrigger>
            <TabsTrigger value="tests" className="text-xs">검사결과</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">경과기록</TabsTrigger>
            <TabsTrigger value="nursing" className="text-xs">간호기록</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[450px] pr-4">
            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="mt-0 space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">환자 정보</p>
                    <p className="text-sm text-muted-foreground">{patient.name} ({patient.gender}) | {patient.birthDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">연락처</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
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

            {/* 경과 기록 탭 */}
            <TabsContent value="progress" className="mt-0 space-y-4">
              <div className="space-y-3">
                {mockEMRData.progressNotes.map((note, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{note.type}</Badge>
                        <span className="text-sm font-medium">{note.date}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{note.doctor}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.note}</p>
                  </div>
                ))}
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
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">입퇴원 이력</h4>
                <div className="space-y-2">
                  {mockEMRData.admissionHistory.map((admission, index) => (
                    <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{admission.admissionDate} ~ {admission.dischargeDate}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">사유: {admission.reason}</p>
                      <p className="text-sm text-muted-foreground mt-1">{admission.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
