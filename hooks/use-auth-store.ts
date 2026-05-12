import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { AuthService, TokenResponse } from "@/services/auth.service"
import api from "@/lib/axios"
import type { AuthUser, UserRole } from "@/types/auth-user"

export type { UserRole, AuthUser as User } from "@/types/auth-user"

/** Spring `GET /api/auth/me` 응답(axios 인터셉터로 `data`만 옴) → 스토어 User */
function mapAuthMeToUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const id = o.id ?? o.userId
  if (id == null) return null
  const roleRaw = String(o.role ?? "").toUpperCase()
  if (!["DOCTOR", "NURSE", "PATIENT"].includes(roleRaw)) return null
  const email = String(o.email ?? "").trim()
  const name = String(o.name ?? "").trim()
  return {
    id: String(id),
    name: name || (email ? email.split("@")[0] : "") || "사용자",
    email,
    role: roleRaw as UserRole,
    phone: String(o.phone ?? "").trim(),
  }
}

async function fetchUserFromSpringMe(): Promise<AuthUser | null> {
  try {
    const res = await api.get("/api/auth/me")
    return mapAuthMeToUser(res.data)
  } catch {
    return null
  }
}

let authStoreApi: { setState: (partial: Partial<AuthState>) => void } | null = null

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isHydrated: boolean

  login: (credentials: any) => Promise<TokenResponse>
  fetchMe: () => Promise<AuthUser | null>
  logout: () => void
}

// JWT decode 함수
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
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

            if (!res.accessToken || !res.role) {
              throw new Error("invalid response")
            }

            // JWT에서 userId 추출
            localStorage.setItem("accessToken", res.accessToken)
            localStorage.setItem("refreshToken", res.refreshToken)
            document.cookie = `user-role=${encodeURIComponent(res.role.toLowerCase())}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

            const fromDb = await fetchUserFromSpringMe()
            if (fromDb) {
              set({
                user: fromDb,
                isAuthenticated: true,
                isLoading: false,
              })
              return res
            }

            const decodedToken = decodeJWT(res.accessToken)
            const userId = decodedToken?.sub || decodedToken?.userId || "unknown"
            const nameClaim = decodedToken?.name
            const displayName =
              typeof nameClaim === "string" && nameClaim.trim() !== ""
                ? nameClaim.trim()
                : credentials.email.split("@")[0]

            const user: AuthUser = {
              id: String(userId),
              name: displayName,
              email: credentials.email,
              role: res.role,
              phone: "",
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

        fetchMe: async (): Promise<AuthUser | null> => {
          const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

          if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false })
            return null
          }

          set({ isLoading: true, error: null })

          try {
            const user = await fetchUserFromSpringMe()

            if (user) {
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              })
              return user
            }

            const response = await fetch("/api/me", {
              credentials: "include",
              headers: { Authorization: `Bearer ${token}` },
            })

            console.log("🔍 /api/me 응답 상태:", response.status, response.statusText)

            if (!response.ok) {
              console.error("❌ /api/me 실패:", response.status)
              set({ user: null, isAuthenticated: false, isLoading: false })
              return null
            }

            const fallback = (await response.json()) as AuthUser

            console.log("✅ /api/me 성공:", fallback)

            set({
              user: fallback,
              isAuthenticated: true,
              isLoading: false,
            })

            return fallback
          } catch (err: any) {
            console.error("❌ /api/me 에러:", err?.message || err)
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