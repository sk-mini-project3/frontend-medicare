import api from "@/lib/axios"

export enum ReservationStatus {
  WAITING = "WAITING",
  NURSE_APPROVED = "NURSE_APPROVED",
  COMPLETED = "COMPLETED"
}

export interface Reservation {
  reservationId: number
  patientId: number
  doctorId: number
  reservationDate: string
  status: ReservationStatus
  symptoms?: string
  /** users.name */
  patientName?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ReservationCreateRequest {
  patientId: number
  doctorId: number
  reservationDate: string // YYYY-MM-DDTHH:mm:ss
  symptoms?: string
}

export interface ReservationStatusUpdateRequest {
  status: ReservationStatus
}

export const ReservationService = {
  async create(request: ReservationCreateRequest): Promise<Reservation> {
    const res = await api.post("/api/reservations", request)
    return res.data
  },

  async getById(id: number): Promise<Reservation> {
    const res = await api.get(`/api/reservations/${id}`)
    return res.data
  },

  async getAll(params?: { status?: ReservationStatus, doctorId?: number, date?: string }): Promise<Reservation[]> {
    const res = await api.get("/api/reservations", { params })
    return res.data
  },

  async getByPatientId(patientId: number): Promise<Reservation[]> {
    const res = await api.get(`/api/reservations/patient/${patientId}`)
    return res.data
  },

  async getMyReservations(): Promise<Reservation[]> {
    const res = await api.get(`/api/reservations/my`)
    return res.data
  },

  async updateStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    const res = await api.patch(`/api/reservations/${id}/status`, { status })
    return res.data
  }
}
