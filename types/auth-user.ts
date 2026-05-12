export type UserRole = "DOCTOR" | "NURSE" | "PATIENT"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
}
