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

let authStoreApi: { setState: (partial: Partial<AuthState>) => void } | null = null

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isHydrated: boolean

  login: (credentials: any) => Promise<TokenResponse>
  fetchMe: () => Promise<User | null>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get, api): AuthState => {
      authStoreApi = api

      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isHydrated: false,

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
          document.cookie = `user-role=${encodeURIComponent(res.role.toLowerCase())}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

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

        fetchMe: async (): Promise<User | null> => {
          const currentUser = get().user

        if (currentUser) {
          return currentUser
        }

        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/me", {
            credentials: "include",
          })

          if (!response.ok) {
            set({ user: null, isAuthenticated: false, isLoading: false })
            return null
          }

          const user = (await response.json()) as User

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })

          return user
        } catch (err: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: err?.message || "failed to load user",
          })

          return null
        }
      },

        logout: () => {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          document.cookie = "user-role=; path=/; max-age=0; samesite=lax"

          set({
            user: null,
            isAuthenticated: false,
          })
        },
      }
    },
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && authStoreApi) {
          authStoreApi.setState({ isHydrated: true })
        }
      },
    }
  )
)