"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Pill, FileText, Calendar, User, ChevronRight, Sun, Sunrise, Moon } from "lucide-react"

interface Medication {
  name: string
  type: "알약" | "가루약" | "물약" | "연고" | "주사"
  dosage: string
  frequency: string
  timing: ("아침" | "점심" | "저녁")[]
  instruction: "식전" | "식후" | "식간" | "취침전"
  duration: string
  notes?: string
}

interface Prescription {
  id: number
  date: Date
  doctor: string
  department: string
  diagnosis: string
  medications: Medication[]
}

interface PrescriptionCardProps {
  prescriptions: Prescription[]
}

const timingIcons = {
  "아침": <Sunrise className="h-3.5 w-3.5" />,
  "점심": <Sun className="h-3.5 w-3.5" />,
  "저녁": <Moon className="h-3.5 w-3.5" />,
}

const typeColors = {
  "알약": "bg-blue-100 text-blue-800",
  "가루약": "bg-orange-100 text-orange-800",
  "물약": "bg-cyan-100 text-cyan-800",
  "연고": "bg-green-100 text-green-800",
  "주사": "bg-red-100 text-red-800",
}

export function PrescriptionCard({ prescriptions }: PrescriptionCardProps) {
  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            처방전
          </CardTitle>
          <CardDescription>의사가 처방한 약 정보를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>처방전이 없습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          처방전
        </CardTitle>
        <CardDescription>의사가 처방한 약 정보를 확인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {prescriptions.map((prescription) => (
            <AccordionItem key={prescription.id} value={`prescription-${prescription.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                    <span className="text-sm font-bold">
                      {prescription.date.getDate()}
                    </span>
                    <span className="text-xs">
                      {prescription.date.toLocaleDateString("ko-KR", { month: "short" })}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{prescription.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.department} · {prescription.doctor}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {/* 처방약 상세 */}
                  <div className="space-y-3">
                    {prescription.medications.map((med, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-primary" />
                            <span className="font-medium">{med.name}</span>
                            <Badge className={typeColors[med.type]} variant="secondary">
                              {med.type}
                            </Badge>
                          </div>
                          <Badge variant="outline">{med.duration}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>용량: {med.dosage}</p>
                          <p>복용: {med.frequency} {med.instruction}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {med.timing.map((time) => (
                              <span
                                key={time}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background border text-xs"
                              >
                                {timingIcons[time]}
                                {time}
                              </span>
                            ))}
                          </div>
                          {med.notes && (
                            <p className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded">
                              참고: {med.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
