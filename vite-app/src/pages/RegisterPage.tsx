import React from "react"
import { Heart, Shield, Clock, Users } from "lucide-react"
import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Heart className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">MediCare</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight text-balance">
                건강한 내일을 위한<br />
                <span className="text-white/90">첫 걸음을 시작하세요</span>
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-md text-pretty">
                MediCare와 함께 체계적인 건강 관리를 시작하세요. 
                빠르고 쉬운 회원가입으로 다양한 의료 서비스를 이용하실 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white/90" />
                <div>
                  <p className="font-semibold">안전한 정보 관리</p>
                  <p className="text-sm text-white/70">암호화된 데이터 보호</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <Clock className="h-8 w-8 text-white/90" />
                <div>
                  <p className="font-semibold">간편한 예약</p>
                  <p className="text-sm text-white/70">24시간 온라인 예약</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm col-span-2">
                <Users className="h-8 w-8 text-white/90" />
                <div>
                  <p className="font-semibold">전문 의료진</p>
                  <p className="text-sm text-white/70">각 분야 최고의 전문의료진이 함께합니다</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/60">
            Copyright 2026 MediCare. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-16 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MediCare</span>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                회원가입
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                MediCare 계정을 만들고 서비스를 이용하세요
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
