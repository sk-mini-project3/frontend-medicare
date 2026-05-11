import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const roleCookie = cookieStore.get("user-role")?.value
  
  // 보안 위험: 쿼리 파라미터로 역할을 결정하는 로직 제거
  // const searchParams = request.nextUrl.searchParams
  // const role = roleCookie || searchParams.get("role") || "doctor"
  
  if (!roleCookie) {
    return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
  }

  const role = roleCookie.toLowerCase()

  const mockUsers: Record<string, any> = {
    doctor: {
      id: "D-2024-001",
      name: "김영수",
      email: "doctor@example.com",
      role: "DOCTOR",
      department: "외과",
      specialty: "순환기내과",
      hospital: "MediCare 종합병원",
      profileImage: "/placeholder-doctor.jpg",
    },
    nurse: {
      id: "N-2024-001",
      name: "박간호사",
      email: "nurse@example.com",
      role: "NURSE",
      department: "내과 병동",
      hospital: "MediCare 종합병원",
      profileImage: "/placeholder-nurse.jpg",
    },
    patient: {
      id: "P-2024-001",
      name: "이환자",
      email: "patient@example.com",
      role: "PATIENT",
      bloodType: "A+",
      birthDate: "1990-05-20",
      profileImage: "/placeholder-avatar.jpg",
    },
  }

  const user = mockUsers[role] || mockUsers.doctor

  return NextResponse.json(user)
}
