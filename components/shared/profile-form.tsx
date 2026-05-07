"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Camera, Eye, EyeOff, Save, User, Mail, Phone, Lock, Droplets, Shield, AlertTriangle } from "lucide-react"

interface ProfileFormProps {
  userRole: "patient" | "nurse" | "doctor"
  initialData?: {
    name: string
    email: string
    phone: string
    profileImage?: string
    // Patient specific
    bloodType?: string
    insurance?: string
    allergies?: string
    // Staff specific
    department?: string
    staffId?: string
  }
}

export function ProfileForm({ userRole, initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Basic Info
  const [name, setName] = useState(initialData?.name || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [phone, setPhone] = useState(initialData?.phone || "")
  const [profileImage, setProfileImage] = useState(initialData?.profileImage || "")

  // Password Change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  // Patient Specific
  const [bloodType, setBloodType] = useState(initialData?.bloodType || "")
  const [insurance, setInsurance] = useState(initialData?.insurance || "")
  const [allergies, setAllergies] = useState(initialData?.allergies || "")

  const handleSaveBasicInfo = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
    setIsLoading(false)
  }

  const handleSaveHealthInfo = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case "patient":
        return "환자"
      case "nurse":
        return "간호사"
      case "doctor":
        return "의사"
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            기본 정보
          </CardTitle>
          <CardDescription>
            프로필 사진과 기본 정보를 관리합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage} alt={name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{getRoleLabel()}</p>
              {(userRole === "nurse" || userRole === "doctor") && initialData?.staffId && (
                <p className="text-sm text-muted-foreground">
                  {initialData.department} | {initialData.staffId}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Basic Info Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일 (계정 ID)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">전화번호</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveBasicInfo} disabled={isLoading} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            기본 정보 저장
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            비밀번호 변경
          </CardTitle>
          <CardDescription>
            계정 보안을 위해 정기적으로 비밀번호를 변경해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && newPassword.length < 8 && (
                <p className="text-xs text-destructive">8자 이상 입력해주세요</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">새 비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다</p>
              )}
            </div>
          </div>

          <Button 
            onClick={handleChangePassword} 
            disabled={isLoading || !currentPassword || !newPassword || newPassword !== confirmNewPassword || newPassword.length < 8}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            비밀번호 변경
          </Button>
        </CardContent>
      </Card>

      {/* Patient Health Info */}
      {userRole === "patient" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              건강 정보
            </CardTitle>
            <CardDescription>
              정확한 진료를 위해 건강 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bloodType">혈액형</Label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={bloodType} onValueChange={setBloodType}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="혈액형 선택" />
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
                <Label htmlFor="insurance">보험 정보</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={insurance} onValueChange={setInsurance}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="보험 유형 선택" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">알레르기 정보</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="allergies"
                  placeholder="알레르기가 있다면 입력해주세요 (예: 페니실린, 땅콩, 해산물 등)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="pl-10 min-h-[100px] resize-none"
                />
              </div>
            </div>

            <Button onClick={handleSaveHealthInfo} disabled={isLoading} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              건강 정보 저장
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
