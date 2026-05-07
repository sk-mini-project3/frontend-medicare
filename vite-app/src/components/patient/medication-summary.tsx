"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ClipboardList, Sunrise, Sun, Moon, AlertCircle } from "lucide-react"

interface MedicationSummaryItem {
  name: string
  type: string
  frequency: string
  timing: ("아침" | "점심" | "저녁")[]
  instruction: "식전" | "식후" | "식간" | "취침전"
}

interface MedicationSummaryProps {
  medications: MedicationSummaryItem[]
}

const timingConfig = {
  "아침": { icon: <Sunrise className="h-4 w-4" />, label: "아침", color: "text-orange-500" },
  "점심": { icon: <Sun className="h-4 w-4" />, label: "점심", color: "text-yellow-500" },
  "저녁": { icon: <Moon className="h-4 w-4" />, label: "저녁", color: "text-indigo-500" },
}

export function MedicationSummary({ medications }: MedicationSummaryProps) {
  // 시간대별로 약 그룹화
  const groupedByTiming = {
    "아침": medications.filter(m => m.timing.includes("아침")),
    "점심": medications.filter(m => m.timing.includes("점심")),
    "저녁": medications.filter(m => m.timing.includes("저녁")),
  }

  if (medications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            복용 요약
          </CardTitle>
          <CardDescription>현재 복용해야 할 약 목록</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>현재 복용 중인 약이 없습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          복용 요약
        </CardTitle>
        <CardDescription>현재 복용해야 할 약 목록</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 시간대별 요약 */}
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(groupedByTiming) as Array<keyof typeof groupedByTiming>).map((time) => (
            <div
              key={time}
              className={`p-3 rounded-lg border text-center ${
                groupedByTiming[time].length > 0 ? "bg-primary/5 border-primary/20" : "bg-muted"
              }`}
            >
              <div className={`flex justify-center mb-1 ${timingConfig[time].color}`}>
                {timingConfig[time].icon}
              </div>
              <p className="text-xs text-muted-foreground">{time}</p>
              <p className="text-lg font-bold">{groupedByTiming[time].length}종</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* 상세 목록 */}
        <div className="space-y-3">
          {medications.map((med, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{med.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {med.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {med.frequency} {med.instruction}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {med.timing.map((time) => (
                  <span
                    key={time}
                    className={`p-1.5 rounded-full bg-background border ${timingConfig[time].color}`}
                    title={time}
                  >
                    {timingConfig[time].icon}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 주의사항 */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">복용 시 주의사항</p>
            <p className="text-xs mt-1">
              정해진 시간에 규칙적으로 복용하시고, 이상 증상이 있으면 즉시 의사에게 알려주세요.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
