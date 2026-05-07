import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  ClipboardList,
  UserPlus,
  Pill,
  Home
} from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface NurseHeaderProps {
  currentView: "reception" | "emr" | "prescription"
  onViewChange: (view: "reception" | "emr" | "prescription") => void
}

export function NurseHeader({ currentView, onViewChange }: NurseHeaderProps) {
  const [notifications] = useState(5)

  const navItems = [
    { id: "reception" as const, label: "접수/예약", icon: UserPlus },
    { id: "emr" as const, label: "환자 조회", icon: ClipboardList },
    { id: "prescription" as const, label: "임시 처방", icon: Pill },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg">MediCare</span>
              <Badge variant="secondary" className="ml-2 text-xs">간호사</Badge>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "gap-2",
                  currentView === item.id && "bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/nurse">
            <Button variant="ghost" size="icon" title="홈">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {notifications}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    박
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">박간호사</p>
                  <p className="text-xs text-muted-foreground">
                    내과 병동 | N-2024-001
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/nurse/profile">
                  <User className="mr-2 h-4 w-4" />
                  내 정보
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/nurse/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" asChild>
                <Link to="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
