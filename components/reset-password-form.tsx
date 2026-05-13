"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { AuthService, getApiErrorMessage } from "@/services/auth.service"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")?.trim() ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>유효하지 않은 재설정 링크입니다. 비밀번호 찾기를 다시 요청해 주세요.</AlertDescription>
        </Alert>
        <Link href="/forgot-password">
          <Button variant="outline" className="w-full h-11">
            비밀번호 찾기로 이동
          </Button>
        </Link>
        <Link href="/" className="block">
          <Button variant="ghost" className="w-full h-11 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            로그인으로 돌아가기
          </Button>
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">비밀번호가 변경되었습니다</h2>
          <p className="text-sm text-muted-foreground">새 비밀번호로 로그인해 주세요.</p>
        </div>
        <Button className="w-full h-12" onClick={() => router.replace("/")}>
          로그인으로 이동
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      return
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    setIsLoading(true)
    try {
      await AuthService.confirmPasswordReset(token, password)
      setDone(true)
    } catch (err) {
      setError(getApiErrorMessage(err, "비밀번호 변경에 실패했습니다."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">새 비밀번호 설정</h2>
        <p className="text-sm text-muted-foreground">메일로 받은 링크는 10분간만 유효합니다.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-foreground/80 text-sm font-medium">
          새 비밀번호
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-12 bg-background border-border"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-foreground/80 text-sm font-medium">
          새 비밀번호 확인
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="한 번 더 입력"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 h-12 bg-background border-border"
            required
            minLength={8}
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-12 font-medium" disabled={isLoading}>
        {isLoading ? "처리 중..." : "비밀번호 변경"}
      </Button>

      <Link href="/" className="block">
        <Button type="button" variant="ghost" className="w-full h-11 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          로그인으로 돌아가기
        </Button>
      </Link>
    </form>
  )
}
