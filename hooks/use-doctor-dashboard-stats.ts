"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuthStore } from "@/hooks/use-auth-store"
import { getNumericUserId } from "@/lib/auth-user"
import { PatientService } from "@/services/patient.service"
import { MedicalRecordService } from "@/services/medical-record.service"
import { PrescriptionService, PrescriptionStatus } from "@/services/prescription.service"

export interface DoctorDashboardStats {
  totalPatients: number
  pendingApprovals: number
  todayMedicalRecords: number
  totalMedicalRecords: number
}

export function useDoctorDashboardStats() {
  const user = useAuthStore((s) => s.user)
  const doctorId = getNumericUserId(user)
  const [stats, setStats] = useState<DoctorDashboardStats>({
    totalPatients: 0,
    pendingApprovals: 0,
    todayMedicalRecords: 0,
    totalMedicalRecords: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (doctorId == null) {
      setStats({
        totalPatients: 0,
        pendingApprovals: 0,
        todayMedicalRecords: 0,
        totalMedicalRecords: 0,
      })
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const [patients, pending, myRecords] = await Promise.all([
        PatientService.getAll().catch(() => []),
        PrescriptionService.getAll({ status: PrescriptionStatus.PENDING }).catch(() => []),
        MedicalRecordService.getByDoctorMe().catch(() => []),
      ])
      const today = new Date().toDateString()
      const todayMedicalRecords = myRecords.filter(
        (r) => new Date(r.createdAt).toDateString() === today
      ).length
      setStats({
        totalPatients: patients.length,
        pendingApprovals: pending.length,
        todayMedicalRecords,
        totalMedicalRecords: myRecords.length,
      })
    } catch {
      setStats({
        totalPatients: 0,
        pendingApprovals: 0,
        todayMedicalRecords: 0,
        totalMedicalRecords: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }, [doctorId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { stats, isLoading, refresh, doctorId }
}
