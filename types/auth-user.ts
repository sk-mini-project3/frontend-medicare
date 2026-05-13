export type UserRole = "DOCTOR" | "NURSE" | "PATIENT"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  /** 의사·간호 등 직원 프로필에서만 내려올 수 있음 */
  department?: string
}
