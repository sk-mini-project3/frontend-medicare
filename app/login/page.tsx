import { LoginForm } from "@/components/login-form"
import { Heart, Shield, Clock, Users } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex">
      {/* 왼쪽 브랜딩 섹션 */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 border border-primary-foreground/20 rounded-full" />
          <div className="absolute top-40 left-40 w-96 h-96 border border-primary-foreground/20 rounded-full" />
          <div className="absolute bottom-20 right-20 w-64 h-64 border border-primary-foreground/20 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          {/* 로고 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">MediCare</span>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-balance">
                건강한 삶을 위한
                <br />
                믿을 수 있는 파트너
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/80 max-w-md leading-relaxed">
                MediCare와 함께 더 나은 의료 서비스를 경험하세요.
                환자 중심의 케어로 건강한 미래를 약속합니다.
              </p>
            </div>

            {/* 특징 카드 */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <FeatureCard
                icon={<Shield className="w-5 h-5" />}
                title="안전한 데이터"
                description="개인정보 보호"
              />
              <FeatureCard
                icon={<Clock className="w-5 h-5" />}
                title="24시간 지원"
                description="언제든 상담 가능"
              />
              <FeatureCard
                icon={<Users className="w-5 h-5" />}
                title="전문 의료진"
                description="1,000+ 전문의"
              />
              <FeatureCard
                icon={<Heart className="w-5 h-5" />}
                title="환자 중심"
                description="맞춤형 케어"
              />
            </div>
          </div>

          {/* 푸터 */}
          <div className="text-sm text-primary-foreground/60">
            © 2024 MediCare. All rights reserved.
          </div>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 섹션 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* 모바일 로고 */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MediCare</span>
          </div>

          {/* 로그인 카드 */}
          <div className="bg-card rounded-2xl shadow-lg shadow-border/50 border border-border p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">로그인</h2>
              <p className="mt-2 text-muted-foreground">
                계정에 로그인하여 서비스를 이용하세요
              </p>
            </div>

            <LoginForm />
          </div>

          {/* 보안 안내 */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>SSL 암호화로 안전하게 보호됩니다</span>
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10">
      <div className="flex items-center gap-3">
        <div className="text-primary-foreground/90">{icon}</div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-primary-foreground/70">{description}</p>
        </div>
      </div>
    </div>
  )
}
