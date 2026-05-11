import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { AuthService, TokenResponse } from "@/services/auth.service"

export type UserRole = "DOCTOR" | "NURSE" | "PATIENT"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (credentials: any) => Promise<TokenResponse>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          const res = await AuthService.login(credentials)

          console.log("ROLE CHECK:", res.role) // 🔥 여기 찍어도 됨

          if (!res.accessToken || !res.role) {
            throw new Error("invalid response")
          }

          localStorage.setItem("accessToken", res.accessToken)
          localStorage.setItem("refreshToken", res.refreshToken)

          const user: User = {
            id: "temp",
            name: credentials.email.split("@")[0],
            email: credentials.email,
            role: res.role,
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })

          return res
        } catch (err: any) {
          set({
            isLoading: false,
            error: err?.message || "login failed",
          })

          throw err
        }
      },

      logout: () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        set({
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)