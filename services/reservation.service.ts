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
  createdAt: string
  updatedAt: string
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
    return api.post("/api/reservations", request)
  },

  async getById(id: number): Promise<Reservation> {
    return api.get(`/api/reservations/${id}`)
  },

  async getAll(params?: { status?: ReservationStatus, doctorId?: number, date?: string }): Promise<Reservation[]> {
    return api.get("/api/reservations", { params })
  },

  async getMyReservations(): Promise<Reservation[]> {
    return api.get(`/api/reservations/my`)
  },

  async updateStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    return api.patch(`/api/reservations/${id}/status`, { status })
  }
}
