import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

// JWT 디코딩 함수
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

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const roleCookie = cookieStore.get("user-role")?.value
  
  if (!roleCookie) {
    return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
  }

  // JWT 토큰에서 사용자 정보 추출 시도
  const authHeader = request.headers.get('Authorization')
  let userId: string | null = null
  let email: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const decoded = decodeJWT(token)
    
    if (decoded) {
      userId = String(decoded.sub || decoded.userId || null)
      email = decoded.email || null
      
      console.log("✅ JWT 디코딩 성공:", { userId, email })

      const nameClaim = decoded.name
      const displayName =
        typeof nameClaim === "string" && nameClaim.trim() !== ""
          ? nameClaim.trim()
          : email?.split("@")[0] || "사용자"

      // JWT 기반 실제 사용자 데이터 반환 (모든 역할)
      return NextResponse.json({
        id: userId,
        name: displayName,
        email: email || "user@example.com",
        role: roleCookie.toUpperCase(),
      })
    }
  }

  console.log("⚠️ JWT 디코딩 실패, mock 데이터 사용")

  // Mock 데이터 (JWT 디코딩 실패 시 fallback)
  const role = roleCookie.toLowerCase()
  const mockUsers: Record<string, any> = {
    doctor: {
      id: "3001",
      name: "김영수",
      email: "doctor@example.com",
      role: "DOCTOR",
      department: "외과",
      specialty: "순환기내과",
      hospital: "MediCare 종합병원",
      profileImage: "/placeholder-doctor.jpg",
    },
    nurse: {
      id: "2001",
      name: "박간호사",
      email: "nurse@example.com",
      role: "NURSE",
      department: "내과 병동",
      hospital: "MediCare 종합병원",
      profileImage: "/placeholder-nurse.jpg",
    },
    patient: {
      id: "4001",
      name: "이환자",
      email: "patient@example.com",
      role: "PATIENT",
      bloodType: "A+",
      birthDate: "1990-05-20",
      profileImage: "/placeholder-user.jpg",
    },
  }

  const user = mockUsers[role] || mockUsers.patient

  return NextResponse.json(user)
}
