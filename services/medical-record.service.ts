import api from "@/lib/axios"

export interface MedicalRecord {
  recordId: number
  reservationId: number | null
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
    const res = await api.post("/api/medical-records", request)
    return res.data
  },

  async getById(id: number): Promise<MedicalRecord> {
    const res = await api.get(`/api/medical-records/${id}`)
    return res.data
  },

  async getByPatient(patientId: number): Promise<MedicalRecord[]> {
    const res = await api.get(`/api/medical-records/patient/${patientId}`)
    return res.data
  },

  /** 로그인 의사가 작성한 진료기록 (최신순) */
  async getByDoctorMe(): Promise<MedicalRecord[]> {
    const res = await api.get("/api/medical-records/doctor/me")
    return res.data
  },

  async getByReservation(reservationId: number): Promise<MedicalRecord> {
    const res = await api.get(`/api/medical-records/reservation/${reservationId}`)
    return res.data
  },

  async update(id: number, request: Partial<MedicalRecordCreateRequest>): Promise<MedicalRecord> {
    const res = await api.put(`/api/medical-records/${id}`, request)
    return res.data
  },

  async getMyRecords(): Promise<MedicalRecord[]> {
    const res = await api.get(`/api/medical-records/my`)
    return res.data
  }
}
