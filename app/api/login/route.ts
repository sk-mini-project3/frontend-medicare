import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body

  // 보안 주의: 실제 운영 환경에서는 데이터베이스에서 유저를 조회하고 
  // 비밀번호를 해시 비교해야 합니다.
  // 여기서는 데모를 위해 고정된 로직을 사용합니다.
  
  if (password === "1234") {
    let role = ""
    if (email === "doctor@example.com") role = "doctor"
    else if (email === "nurse@example.com") role = "nurse"
    else if (email === "patient@example.com") role = "patient"

    if (role) {
      const response = NextResponse.json({ success: true, role })
      
      // HttpOnly 쿠키로 설정하여 클라이언트 사이드 스크립트에서 접근 불가하게 함 (XSS 방어)
      response.cookies.set("user-role", role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1주일
      })
      
      return response
    }
  }

  return NextResponse.json(
    { message: "이메일 또는 비밀번호가 올바르지 않습니다." },
    { status: 401 }
  )
}
