"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pill, Trash2, Send, Loader2 } from "lucide-react"
import type { Patient } from "./patient-search"
import { MedicalRecordService } from "@/services/medical-record.service"
import { PrescriptionService } from "@/services/prescription.service"
import { useAuthStore } from "@/hooks/use-auth-store"
import { toast } from "sonner"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  timing: string[]
  duration: string
  instructions?: string
}

interface PrescriptionFormProps {
  patient: Patient
  reservationId?: number
}

const commonMedications = [
  { name: "아모잘탄정", category: "고혈압" },
  { name: "메트포르민정", category: "당뇨" },
  { name: "아스피린정", category: "혈전예방" },
  { name: "타이레놀정", category: "해열진통" },
  { name: "오메프라졸캡슐", category: "위장약" },
  { name: "세티리진정", category: "알레르기" },
  { name: "아목시실린캡슐", category: "항생제" },
  { name: "프레드니솔론정", category: "스테로이드" },
]

const frequencyOptions = [
  { value: "1", label: "하루 1회" },
  { value: "2", label: "하루 2회" },
  { value: "3", label: "하루 3회" },
  { value: "prn", label: "필요시" },
]

const timingOptions = [
  { value: "morning", label: "아침" },
  { value: "lunch", label: "점심" },
  { value: "dinner", label: "저녁" },
  { value: "bedtime", label: "취침전" },
]

export function PrescriptionForm({ patient, reservationId }: PrescriptionFormProps) {
  const { user } = useAuthStore()
  const [medications, setMedications] = useState<Medication[]>([])
  const [isAddingMed, setIsAddingMed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newMed, setNewMed] = useState<Partial<Medication>>({
    timing: [],
  })
  const [diagnosis, setDiagnosis] = useState("")
  const [treatmentNotes, setTreatmentNotes] = useState("")

  const handleAddMedication = () => {
    if (newMed.name && newMed.dosage && newMed.frequency && newMed.duration) {
      setMedications([
        ...medications,
        {
          id: Date.now().toString(),
          name: newMed.name,
          dosage: newMed.dosage,
          frequency: newMed.frequency,
          timing: newMed.timing || [],
          duration: newMed.duration,
          instructions: newMed.instructions,
        },
      ])
      setNewMed({ timing: [] })
      setIsAddingMed(false)
    }
  }

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id))
  }

  const handleTimingToggle = (timing: string) => {
    const currentTiming = newMed.timing || []
    if (currentTiming.includes(timing)) {
      setNewMed({ ...newMed, timing: currentTiming.filter((t) => t !== timing) })
    } else {
      setNewMed({ ...newMed, timing: [...currentTiming, timing] })
    }
  }

  const getTimingLabel = (timing: string[]) => {
    const labels: Record<string, string> = {
      morning: "아침",
      lunch: "점심",
      dinner: "저녁",
      bedtime: "취침전",
    }
    return timing.map((t) => labels[t]).join(", ")
  }

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      "1": "하루 1회",
      "2": "하루 2회",
      "3": "하루 3회",
      "prn": "필요시",
    }
    return labels[freq] || freq
  }

  const handleSubmitPrescription = async () => {
    if (!user) return
    
    setIsSubmitting(true)
    try {
      // 1. 진료 기록 생성
      const patientId = parseInt(patient.id.replace(/[^0-9]/g, "")) || 1 // 임시 ID 변환 로직
      
      await MedicalRecordService.create({
        patientId,
        doctorId: parseInt(user.id),
        reservationId,
        diagnosis,
        treatmentNotes
      })

      // 2. 처방전 생성 (각 약물마다 별도 생성)
      for (const med of medications) {
        await PrescriptionService.create({
          patientId,
          doctorId: parseInt(user.id),
          reservationId,
          medication: med.name,
          dosage: `${med.dosage} | ${getFrequencyLabel(med.frequency)} | ${getTimingLabel(med.timing)} | ${med.duration} | ${med.instructions || ""}`
        })
      }

      toast.success(`${patient.name} 환자의 진료 기록 및 처방전이 저장되었습니다.`)
      setMedications([])
      setDiagnosis("")
      setTreatmentNotes("")
    } catch (error) {
      console.error(error)
      toast.error("저장에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Pill className="h-5 w-5" />
          진료 기록 및 처방
        </CardTitle>
        <CardDescription>
          {patient.name} 환자의 진료 내용을 기록하고 약물을 처방하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="diagnosis">진단명</Label>
          <Input
            id="diagnosis"
            placeholder="진단명을 입력하세요"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="treatmentNotes">의사 소견 및 처치 상세</Label>
          <Textarea
            id="treatmentNotes"
            placeholder="환자 상태 및 처치 내용을 상세히 기록하세요"
            className="min-h-[100px]"
            value={treatmentNotes}
            onChange={(e) => setTreatmentNotes(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>처방 약물</Label>
            <Dialog open={isAddingMed} onOpenChange={setIsAddingMed}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  약물 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>약물 추가</DialogTitle>
                  <DialogDescription>
                    처방할 약물 정보를 입력하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="medName">약물명</Label>
                    <Select onValueChange={(value) => setNewMed({ ...newMed, name: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="약물 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMedications.map((med) => (
                          <SelectItem key={med.name} value={med.name}>
                            <span>{med.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({med.category})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">용량</Label>
                      <Input
                        id="dosage"
                        placeholder="예: 500mg"
                        value={newMed.dosage || ""}
                        onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">투약 기간</Label>
                      <Input
                        id="duration"
                        placeholder="예: 7일"
                        value={newMed.duration || ""}
                        onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>복용 횟수</Label>
                    <Select onValueChange={(value) => setNewMed({ ...newMed, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="복용 횟수 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>복용 시간</Label>
                    <div className="flex flex-wrap gap-2">
                      {timingOptions.map((opt) => (
                        <Button
                          key={opt.value}
                          type="button"
                          variant={newMed.timing?.includes(opt.value) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTimingToggle(opt.value)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">복용 지침</Label>
                    <Textarea
                      id="instructions"
                      placeholder="예: 식후 30분 복용"
                      value={newMed.instructions || ""}
                      onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingMed(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddMedication}>
                    추가
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {medications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              처방할 약물을 추가하세요
            </div>
          ) : (
            <div className="space-y-2">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-start justify-between p-3 border rounded-lg bg-secondary/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{med.name}</span>
                      <Badge variant="outline" className="text-xs">{med.dosage}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getFrequencyLabel(med.frequency)} | {getTimingLabel(med.timing)} | {med.duration}
                    </p>
                    {med.instructions && (
                      <p className="text-xs text-muted-foreground">{med.instructions}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveMedication(med.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full"
          disabled={isSubmitting || !diagnosis || !treatmentNotes}
          onClick={handleSubmitPrescription}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          진료 완료 및 처방전 발행
        </Button>
      </CardContent>
    </Card>
  )
}
