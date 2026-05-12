"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Mail, Lock, User, Phone, ShieldCheck, ArrowRight, ArrowLeft, Droplets, Shield, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthService } from "@/services/auth.service"
import { toast } from "sonner"

type UserRole = "patient" | "nurse" | "doctor"

// 백엔드 src/main/resources/verification-codes.yml 과 동기화
const NURSE_CODES = ["NURSE-1111", "NURSE-2222", "NURSE-3333"]
const DOCTOR_CODES = ["DOCTOR-1234", "DOCTOR-5678", "DOCTOR-9999"]

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationError, setVerificationError] = useState("")

  // Step 1: Role Selection
  const [role, setRole] = useState<UserRole>("patient")
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  // Step 2: Basic Info
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Step 3: Additional Info (Patient Only)
  const [bloodType, setBloodType] = useState("")
  const [insurance, setInsurance] = useState("")
  const [allergies, setAllergies] = useState("")

  const handleVerifyCode = () => {
    setVerificationError("")
    
    const code = verificationCode.trim()
    if (role === "nurse") {
      if (NURSE_CODES.includes(code)) {
        setIsVerified(true)
      } else {
        setVerificationError(`유효한 코드: ${NURSE_CODES.join(", ")}`)
        setIsVerified(false)
      }
    } else if (role === "doctor") {
      if (DOCTOR_CODES.includes(code)) {
        setIsVerified(true)
      } else {
        setVerificationError(`유효한 코드: ${DOCTOR_CODES.join(", ")}`)
        setIsVerified(false)
      }
    }
  }

  const canProceedStep1 = () => {
    if (role === "patient") return true
    return isVerified
  }

  const canProceedStep2 = () => {
    const base =
      name.trim() !== "" &&
      email.trim() !== "" &&
      phone.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      password === confirmPassword &&
      password.length >= 8
    if (!base) return false
    if (role === "doctor" || role === "nurse") {
      return isVerified && verificationCode.trim() !== ""
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const signupData: Record<string, unknown> = {
        name,
        email,
        phone,
        password,
        role: role.toUpperCase(),
      }
      if (role === "doctor") {
        signupData.doctorCode = verificationCode.trim()
      } else if (role === "nurse") {
        signupData.nurseCode = verificationCode.trim()
      }
      if (role === "patient") {
        if (bloodType.trim()) signupData.bloodType = bloodType.trim()
        if (insurance.trim()) signupData.insuranceInfo = insurance.trim()
        if (allergies.trim()) signupData.allergies = allergies.trim()
      }
      
      console.log("📝 회원가입 요청:", JSON.stringify(signupData, null, 2))
      
      await AuthService.signup(signupData)
      
      console.log("✅ 회원가입 성공!")
      
      // 환자의 추가 정보를 localStorage에 저장 (나중에 프로필에서 표시)
      if (role === "patient") {
        const patientInfo = {
          name,
          email,
          phone,
          bloodType,
          insurance,
          allergies,
          role: "PATIENT"
        }
        localStorage.setItem("patientInfo", JSON.stringify(patientInfo))
        console.log("💾 환자 정보 저장:", patientInfo)
      }
      
      toast.success("회원가입이 완료되었습니다. 로그인해주세요.")
      router.push("/login")
    } catch (error: unknown) {
      console.error("❌ 회원가입 실패 - 전체:", error)
      const err = error as { response?: { data?: { message?: string }; status?: number } }
      console.error("❌ 회원가입 실패 - 응답:", err.response)
      console.error("❌ 회원가입 실패 - 상태코드:", err.response?.status)
      const msg =
        err.response?.data?.message ??
        (typeof err.response?.data === "string" ? err.response.data : undefined)
      console.error("❌ 회원가입 실패 - 메시지:", msg)
      toast.error(msg || "회원가입에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalSteps = role === "patient" ? 3 : 2

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i + 1 === step ? "w-8 bg-primary" : i + 1 < step ? "w-8 bg-primary/50" : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step 1: Role Selection & Verification */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-foreground/80 text-sm font-medium">
              회원 유형을 선택해주세요
            </Label>
            <RadioGroup
              value={role}
              onValueChange={(value: UserRole) => {
                setRole(value)
                setIsVerified(false)
                setVerificationCode("")
                setVerificationError("")
              }}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="patient"
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 cursor-pointer transition-all hover:bg-secondary/50",
                  role === "patient" && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value="patient" id="patient" className="sr-only" />
                <User className={cn("h-8 w-8 mb-2", role === "patient" ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", role === "patient" ? "text-primary" : "text-muted-foreground")}>
                  환자
                </span>
              </Label>
              <Label
                htmlFor="nurse"
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 cursor-pointer transition-all hover:bg-secondary/50",
                  role === "nurse" && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value="nurse" id="nurse" className="sr-only" />
                <ShieldCheck className={cn("h-8 w-8 mb-2", role === "nurse" ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", role === "nurse" ? "text-primary" : "text-muted-foreground")}>
                  간호사
                </span>
              </Label>
              <Label
                htmlFor="doctor"
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 cursor-pointer transition-all hover:bg-secondary/50",
                  role === "doctor" && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value="doctor" id="doctor" className="sr-only" />
                <Shield className={cn("h-8 w-8 mb-2", role === "doctor" ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", role === "doctor" ? "text-primary" : "text-muted-foreground")}>
                  의사
                </span>
              </Label>
            </RadioGroup>
          </div>

          {/* Verification Code for Nurse/Doctor */}
          {(role === "nurse" || role === "doctor") && (
            <div className="space-y-3 p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>{role === "nurse" ? "간호사" : "의사"} 인증이 필요합니다</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                가입 시 입력하는 <strong>이름</strong>은 <code className="text-[11px]">verification-codes.yml</code>에
                적힌 해당 코드의 <strong>ownerName</strong>과 같아야 합니다. (서버 재시작 시 YAML이 DB에 반영됩니다.)
              </p>
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-foreground/80 text-sm font-medium">
                  인증 코드
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="인증 코드를 입력하세요"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value)
                      setVerificationError("")
                      setIsVerified(false)
                    }}
                    className="h-11 bg-background"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleVerifyCode}
                    disabled={!verificationCode.trim()}
                  >
                    인증
                  </Button>
                </div>
                {verificationError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {verificationError}
                  </p>
                )}
                {isVerified && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    인증이 완료되었습니다.
                  </p>
                )}
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={() => setStep(2)}
            disabled={!canProceedStep1()}
            className="w-full h-12 bg-primary hover:bg-accent text-primary-foreground font-medium"
          >
            다음
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Basic Information */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground/80 text-sm font-medium">
              이름
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder={
                  role === "doctor"
                    ? "김의사 (verification-codes.yml의 ownerName과 동일)"
                    : role === "nurse"
                      ? "간호사 (코드에 등록된 이름과 동일)"
                      : "홍길동"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 bg-background border-border"
                required
              />
            </div>
            {(role === "doctor" || role === "nurse") && (
              <p className="text-xs text-muted-foreground">
                의사·간호사는 인증코드마다 등록된 이름과 한 글자도 다르지 않게 일치해야 합니다. YAML을 바꾼 뒤에는 Spring 서버를 재시작해야 DB에 반영됩니다.
              </p>
            )}
          </div>

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
                className="pl-10 h-12 bg-background border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground/80 text-sm font-medium">
              전화번호
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-12 bg-background border-border"
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
                placeholder="8자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-background border-border"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && password.length < 8 && (
              <p className="text-xs text-destructive">비밀번호는 8자 이상이어야 합니다.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground/80 text-sm font-medium">
              비밀번호 확인
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-background border-border"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 h-12"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전
            </Button>
            {role === "patient" ? (
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2()}
                className="flex-1 h-12 bg-primary hover:bg-accent text-primary-foreground"
              >
                다음
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceedStep2() || isLoading}
                className="flex-1 h-12 bg-primary hover:bg-accent text-primary-foreground"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    가입 중...
                  </div>
                ) : (
                  "회원가입"
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Additional Patient Info */}
      {step === 3 && role === "patient" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/30 border border-border">
            <p className="text-sm text-muted-foreground">
              아래 정보는 선택 사항입니다. 나중에 내 정보 페이지에서 수정할 수 있습니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodType" className="text-foreground/80 text-sm font-medium">
              혈액형
            </Label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger className="pl-10 h-12 bg-background border-border">
                  <SelectValue placeholder="혈액형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance" className="text-foreground/80 text-sm font-medium">
              보험 정보
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select value={insurance} onValueChange={setInsurance}>
                <SelectTrigger className="pl-10 h-12 bg-background border-border">
                  <SelectValue placeholder="보험 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">국민건강보험</SelectItem>
                  <SelectItem value="medical-aid-1">의료급여 1종</SelectItem>
                  <SelectItem value="medical-aid-2">의료급여 2종</SelectItem>
                  <SelectItem value="private">민간보험</SelectItem>
                  <SelectItem value="none">보험 없음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-foreground/80 text-sm font-medium">
              알레르기 정보
            </Label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="allergies"
                placeholder="알레르기가 있다면 입력해주세요 (예: 페니실린, 땅콩, 해산물 등)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="pl-10 min-h-[100px] bg-background border-border resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1 h-12"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 bg-primary hover:bg-accent text-primary-foreground"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  가입 중...
                </div>
              ) : (
                "회원가입 완료"
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-primary hover:text-accent font-medium transition-colors">
            로그인
          </Link>
        </p>
      )}
    </form>
  )
}
