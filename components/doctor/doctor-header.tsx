"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Settings, User, Menu, Stethoscope, Home } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useRouter } from "next/navigation"

interface DoctorHeaderProps {
  doctorName: string
  doctorId: string
  pendingApprovals?: number
}

export function DoctorHeader({ doctorName, doctorId, pendingApprovals = 0 }: DoctorHeaderProps) {
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
      // 실패하더라도 일단 홈으로 이동 시도
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/doctor" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-lg">MediCare</span>
              <Badge variant="secondary" className="ml-2 text-xs">의사</Badge>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/doctor" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            환자 조회
          </Link>
          <Link href="/doctor/prescriptions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative">
            처방 관리
            {pendingApprovals > 0 && (
              <span className="absolute -top-2 -right-4 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
                {pendingApprovals}
              </span>
            )}
          </Link>
          <Link href="/doctor/records" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            진료 기록
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/doctor">
            <Button variant="ghost" size="icon" title="홈">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {pendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
                {pendingApprovals}
              </span>
            )}
            <span className="sr-only">알림</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-doctor.jpg" alt={doctorName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {doctorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{doctorName} 선생님</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    의사 | {doctorId}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/doctor/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>내 정보</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/doctor/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" 
                onSelect={(e) => {
                  e.preventDefault()
                  handleLogout()
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
