import api from "@/lib/axios"

export interface MedicalRecord {
  recordId: number
  reservationId: number
  patientId: number
  doctorId: number
  diagnosis: string
  treatmentNotes: string
  createdAt: string
  updatedAt: string
}

export interface MedicalRecordCreateRequest {
  patientId: number
  doctorId: number
  reservationId?: number
  diagnosis: string
  treatmentNotes: string
}

export const MedicalRecordService = {
  async create(request: MedicalRecordCreateRequest): Promise<MedicalRecord> {
    return api.post("/api/medical-records", request)
  },

  async getById(id: number): Promise<MedicalRecord> {
    return api.get(`/api/medical-records/${id}`)
  },

  async getByPatient(patientId: number): Promise<MedicalRecord[]> {
    return api.get(`/api/medical-records/patient/${patientId}`)
  },

  async getByReservation(reservationId: number): Promise<MedicalRecord> {
    return api.get(`/api/medical-records/reservation/${reservationId}`)
  },

  async update(id: number, request: Partial<MedicalRecordCreateRequest>): Promise<MedicalRecord> {
    return api.put(`/api/medical-records/${id}`, request)
  },

  async getMyRecords(): Promise<MedicalRecord[]> {
    return api.get(`/api/medical-records/my`)
  }
}
