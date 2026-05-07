import React from "react"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { Heart, Shield, Clock, Phone } from "lucide-react"
import { Link } from "react-router-dom"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
                <Heart className="h-7 w-7" />
              </div>
              <span className="text-2xl font-bold">MediCare</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight text-balance">
                안전한 계정 복구
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed text-pretty">
                걱정하지 마세요. 등록된 이메일로 비밀번호 재설정 링크를 보내드립니다.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/20">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">안전한 재설정 과정</h3>
                  <p className="text-sm text-primary-foreground/70 mt-1">
                    본인 확인을 위해 등록된 이메일로만 링크가 발송됩니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/20">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">24시간 유효</h3>
                  <p className="text-sm text-primary-foreground/70 mt-1">
                    보안을 위해 재설정 링크는 24시간 동안만 유효합니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/20">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">도움이 필요하신가요?</h3>
                  <p className="text-sm text-primary-foreground/70 mt-1">
                    고객센터 1588-0000으로 문의해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-primary-foreground/60">
            Copyright 2024 MediCare. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediCare</span>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <ForgotPasswordForm />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            로그인 페이지로 돌아가시려면{" "}
            <Link to="/" className="text-primary hover:text-accent font-medium transition-colors">
              여기를 클릭
            </Link>
            하세요.
          </p>
        </div>
      </div>
    </div>
  )
}
