import axios from "axios"

/** 백엔드(Spring) 기본 주소. 배포 시에는 NEXT_PUBLIC_API_URL 로 덮어씁니다. */
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
    // 백엔드 응답 형태 정규화
    // 1. 이미 ApiResponse 형태면 data 추출
    if (res.data && typeof res.data === "object" && "success" in res.data && "data" in res.data) {
      // ApiResponse 형태 → data 필드만 반환
      return {
        ...res,
        data: res.data.data,
      }
    }
    // 2. 그 외 (예: 로그인은 직접 TokenResponse 반환)
    return res
  },
  (err) => Promise.reject(err)
)

export default api