import axios from "axios"

/** API 기본 URL (`NEXT_PUBLIC_API_URL`) */
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  return "http://localhost:3000"
}

const baseURL = resolveApiBaseUrl()

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === "object" && "success" in res.data && "data" in res.data) {
      return {
        ...res,
        data: res.data.data,
      }
    }
    return res
  },
  (err) => Promise.reject(err)
)

export default api