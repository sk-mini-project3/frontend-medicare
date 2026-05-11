"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Settings, User, Menu, Home } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useRouter } from "next/navigation"

interface PatientHeaderProps {
  patientName: string
  patientId: string
}

export function PatientHeader({ patientName, patientId }: PatientHeaderProps) {
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/patient" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">M</span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">MediCare</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/patient" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            대시보드
          </Link>
          <Link href="/patient/appointments" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            예약 관리
          </Link>
          <Link href="/patient/prescriptions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            처방전
          </Link>
          <Link href="/patient/records" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            진료 기록
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/patient">
            <Button variant="ghost" size="icon" title="홈">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
              2
            </span>
            <span className="sr-only">알림</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={patientName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {patientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{patientName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    환자번호: {patientId}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/patient/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>내 정보</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/patient/settings">
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
