"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, ArrowRight, AlertCircle } from "lucide-react"
import { AuthService, getApiErrorMessage } from "@/services/auth.service"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await AuthService.requestPasswordReset(email.trim())
      setIsSubmitted(true)
    } catch (err) {
      setError(getApiErrorMessage(err, "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">이메일을 확인해주세요</h2>
          <p className="text-sm text-muted-foreground">
            등록된 계정이 있다면{" "}
            <span className="font-medium text-foreground">{email}</span>으로
            <br />
            재설정 링크를 보냈습니다. (스팸함도 확인해 주세요)
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground">
            이메일을 받지 못하셨나요? 스팸 폴더를 확인하시거나
            <br />
            아래 버튼을 눌러 다시 시도해주세요.
          </p>
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => {
              setIsSubmitted(false)
              setEmail("")
              setError("")
            }}
          >
            다시 시도하기
          </Button>
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full h-11 text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              로그인으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">비밀번호를 잊으셨나요?</h2>
        <p className="text-sm text-muted-foreground">
          가입하신 이메일 주소를 입력하시면
          <br />
          비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

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

      <Button
        type="submit"
        className="w-full h-12 bg-primary hover:bg-accent text-primary-foreground font-medium text-base transition-all duration-200 group"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            전송 중...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            재설정 링크 받기
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </Button>

      <Link href="/" className="block">
        <Button variant="ghost" className="w-full h-11 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          로그인으로 돌아가기
        </Button>
      </Link>
    </form>
  )
}
