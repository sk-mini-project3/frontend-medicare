import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft } from "lucide-react"

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">403</h1>
          <h2 className="text-2xl font-bold">접근 권한이 없습니다</h2>
          <p className="text-muted-foreground">
            이 페이지에 접근할 수 있는 권한이 없습니다. 
            올바른 계정으로 로그인했는지 확인해주세요.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/login">
            <Button className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              로그인 페이지로 돌아가기
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              메인 화면으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
