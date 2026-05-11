import api from "@/lib/axios"

export enum PrescriptionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface Prescription {
  prescriptionId: number
  reservationId: number
  patientId: number
  doctorId: number
  nurseId?: number
  medication: string
  dosage: string
  status: PrescriptionStatus
  createdAt: string
  updatedAt: string
}

export interface PrescriptionCreateRequest {
  patientId: number
  reservationId: number
  doctorId?: number
  nurseId?: number
  medication: string
  dosage: string
}

export const PrescriptionService = {
  async create(request: PrescriptionCreateRequest): Promise<Prescription> {
    return api.post("/api/prescriptions", request)
  },

  async getAll(): Promise<Prescription[]> {
    return api.get("/api/prescriptions")
  },

  async getById(id: number): Promise<Prescription> {
    return api.get(`/api/prescriptions/${id}`)
  },

  async getByPatient(patientId: number): Promise<Prescription[]> {
    return api.get(`/api/prescriptions/patient/${patientId}`)
  },

  async getMyPrescriptions(): Promise<Prescription[]> {
    return api.get(`/api/prescriptions/my`)
  },

  async approve(id: number): Promise<Prescription> {
    return api.patch(`/api/prescriptions/${id}/approve`)
  },

  async reject(id: number): Promise<Prescription> {
    return api.patch(`/api/prescriptions/${id}/reject`)
  },

  async verify(id: number): Promise<Prescription> {
    return api.get(`/api/prescriptions/${id}/verify`)
  }
}
