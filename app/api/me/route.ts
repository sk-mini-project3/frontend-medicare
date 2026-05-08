import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const roleCookie = cookieStore.get("user-role")?.value
  
  const searchParams = request.nextUrl.searchParams
  const role = roleCookie || searchParams.get("role") || "doctor"

  const mockUsers: Record<string, any> = {
    doctor: {
      id: "D-2024-001",
      name: "김의사",
      email: "doctor@example.com",
      role: "DOCTOR",
      department: "내과",
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
