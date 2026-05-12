import api from "@/lib/axios"

export enum PrescriptionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface Prescription {
  prescriptionId: number
  reservationId: number | null
  patientId: number
  doctorId: number | null
  nurseId?: number | null
  medication: string
  dosage: string
  status: PrescriptionStatus
  createdAt: string
  updatedAt?: string
  approvedBy?: number | null
}

export interface PrescriptionCreateRequest {
  patientId: number
  reservationId?: number | null
  doctorId?: number | null
  nurseId?: number | null
  medication: string
  dosage: string
}

export const PrescriptionService = {
  async create(request: PrescriptionCreateRequest): Promise<Prescription> {
    const res = await api.post("/api/prescriptions", request)
    return res.data
  },

  async getAll(params?: {
    status?: PrescriptionStatus
    nurseId?: number
    doctorId?: number
  }): Promise<Prescription[]> {
    const res = await api.get("/api/prescriptions", { params })
    return res.data
  },

  async getById(id: number): Promise<Prescription> {
    const res = await api.get(`/api/prescriptions/${id}`)
    return res.data
  },

  async getByPatient(patientId: number): Promise<Prescription[]> {
    const res = await api.get(`/api/prescriptions/patient/${patientId}`)
    return res.data
  },

  async getMyPrescriptions(): Promise<Prescription[]> {
    const res = await api.get(`/api/prescriptions/my`)
    return res.data
  },

  async approve(id: number, _doctorId?: number): Promise<Prescription> {
    const res = await api.patch(`/api/prescriptions/${id}/approve`)
    return res.data
  },

  async reject(id: number): Promise<Prescription> {
    const res = await api.patch(`/api/prescriptions/${id}/reject`)
    return res.data
  },

  async verify(id: number): Promise<Prescription> {
    const res = await api.get(`/api/prescriptions/${id}/verify`)
    return res.data
  }
}
