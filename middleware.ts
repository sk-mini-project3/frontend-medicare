import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 보호된 경로와 해당 역할 정의
const roleRoutes = {
  "/doctor": "DOCTOR",
  "/nurse": "NURSE",
  "/patient": "PATIENT",
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const roleCookie = request.cookies.get("user-role")?.value

  // 역할 기반 경로 접근 제어
  for (const [route, role] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      if (!roleCookie) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      if (roleCookie.toUpperCase() !== role) {
        return NextResponse.redirect(new URL("/403", request.url))
      }
    }
  }

  // 로그인/회원가입 페이지 접근 시 이미 로그인된 경우 리다이렉트
  if ((pathname === "/login" || pathname === "/register") && roleCookie) {
    const targetPath = `/${roleCookie.toLowerCase()}`
    return NextResponse.redirect(new URL(targetPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/doctor/:path*",
    "/nurse/:path*",
    "/patient/:path*",
    "/login",
    "/register",
  ],
}
