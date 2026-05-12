import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 성별 미등록·placeholder 일 때 UI에 괄호/뱃지로 숨김 */
export function isMeaningfulPatientGender(g: string | null | undefined): boolean {
  const s = (g ?? "").trim()
  if (!s) return false
  if (s === "—" || s === "-" || s === "미입력" || s === "미기입") return false
  return true
}
