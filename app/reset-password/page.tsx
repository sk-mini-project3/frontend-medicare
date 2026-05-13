import { Suspense } from "react"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { Heart } from "lucide-react"

function ResetPasswordFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
      불러오는 중…
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-12 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">MediCare</span>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
          <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/forgot-password" className="text-primary hover:underline font-medium">
            비밀번호 찾기
          </Link>
          {" · "}
          <Link href="/" className="text-primary hover:underline font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
