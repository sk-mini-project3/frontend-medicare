"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/hooks/use-auth-store"


export function LoginForm() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("🔥 SUBMIT TRIGGERED")

    setIsLoading(true)
    setError("")

    try {
      const res = await login({ email, password })

      console.log("LOGIN RAW RESULT:", res)
      console.log("ROLE:", res?.role)
      console.log("ROLE CHECK:", res?.role)

      const role = res?.role

      if (!role) {
        throw new Error("역할 정보를 확인할 수 없습니다.")
      }

      // 🔥 핵심: 상태 반영 타이밍 안정화
      await new Promise((resolve) => setTimeout(resolve, 0))

      // 쿠키/보호 라우트와 맞추기 위해 전체 이동으로 전환
      window.location.replace(`/${role.toLowerCase()}`)

    } catch (err: any) {
      console.error("LOGIN ERROR:", err)

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "로그인 실패"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">
          이메일
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 bg-background border-border focus:border-primary focus:ring-primary/20"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground/80 text-sm font-medium">
          비밀번호
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-12 bg-background border-border focus:border-primary focus:ring-primary/20"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
            로그인 상태 유지
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:text-accent transition-colors font-medium"
        >
          비밀번호 찾기
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-primary hover:bg-accent text-primary-foreground font-medium text-base transition-all duration-200 group"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            로그인 중...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            로그인
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-primary hover:text-accent font-medium transition-colors">
          회원가입
        </Link>
      </p>
    </form>
  )
}
