import api from "@/lib/axios"
import { User, UserRole } from "@/hooks/use-auth-store"

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  role: UserRole
}

export const AuthService = {
  /**
   * 로그인 (🔥 핵심: data만 반환)
   */
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

  async getMe(): Promise<User> {
    const res = await api.get("/api/auth/me")
    return res.data
  }
}