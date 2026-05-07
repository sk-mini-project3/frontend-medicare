import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 네비게이션 */}
      <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MediCare</span>
          </div>
          <Link href="/login">
            <Button variant="ghost">로그인</Button>
          </Link>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              새로운 의료 서비스의 시작
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance">
              더 똑똑하고 편리한 <br/>
              <span className="text-primary">디지털 헬스케어</span> 솔루션
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              MediCare는 환자와 의료진을 연결하는 혁신적인 플랫폼입니다. 
              언제 어디서나 체계적인 건강 관리를 시작해보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-lg gap-2">
                  지금 시작하기
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-14 text-lg">
                서비스 알아보기
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
