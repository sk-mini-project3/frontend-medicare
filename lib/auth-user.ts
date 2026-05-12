/**
 * Spring JWT의 `sub`는 숫자 userId 문자열입니다.
 * `/api/me` 목업 등으로 `user.id`가 비숫자일 때는 토큰 payload에서 다시 읽습니다.
 */
export function getNumericUserId(user: { id: string } | null | undefined): number | null {
  if (!user?.id) return null
  const direct = parseInt(user.id, 10)
  if (!Number.isNaN(direct)) return direct

  if (typeof window === "undefined") return null
  const token = localStorage.getItem("accessToken")
  if (!token) return null
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    const payload = JSON.parse(json) as { sub?: string | number; userId?: string | number }
    const sub = payload.sub ?? payload.userId
    if (sub == null) return null
    const n = parseInt(String(sub), 10)
    return Number.isNaN(n) ? null : n
  } catch {
    return null
  }
}
