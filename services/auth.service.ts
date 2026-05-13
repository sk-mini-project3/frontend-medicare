import api from "@/lib/axios"
import type { AuthUser, UserRole } from "@/types/auth-user"
import axios from "axios"

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  role: UserRole
}

/** 오류 응답에서 메시지 문자열 추출 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as Record<string, unknown> | undefined
    const m = d?.message
    if (typeof m === "string" && m.trim()) return m.trim()
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export const AuthService = {
  async login(credentials: any): Promise<TokenResponse> {
    const res = await api.post("/api/auth/login", credentials)
    return res.data
  },

  async signup(data: any): Promise<void> {
    await api.post("/api/auth/signup", data)
  },

  async logout(): Promise<void> {
    await api.post("/api/auth/logout")
  },

  async getMe(): Promise<AuthUser> {
    const res = await api.get("/api/auth/me")
    return res.data
  },

  /** 서버에 등록된 의사·간호사 인증코드인지 확인 */
  async validateStaffCode(role: "DOCTOR" | "NURSE", code: string): Promise<void> {
    await api.post("/api/auth/validate-staff-code", { role, code })
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post("/api/auth/password-reset/request", { email })
  },

  /** 메일 링크의 토큰 + 새 비밀번호로 변경 */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    await api.post("/api/auth/password-reset/confirm", { token, newPassword })
  },
}