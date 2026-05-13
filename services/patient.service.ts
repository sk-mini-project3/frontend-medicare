import api from "@/lib/axios"

export interface PatientDetailsDto {
  userId: number
  name: string
  phone: string
  gender: string
  birthDate: string
  emergencyContact: string
  bloodType: string
  address: string
  insuranceInfo: string
  allergies: string
  /** 상세 정보 등록 여부 */
  patientDetailsRegistered?: boolean
}

/** 로그인 환자 본인 프로필 */
export interface MyPatientProfileDto {
  name: string
  email: string
  phone: string
  gender: string | null
  birthDate: string | null
  bloodType: string | null
  insuranceInfo: string | null
  allergies: string | null
}

/** staff lookup 응답 정규화 */
function normalizeStaffPatientLookup(raw: unknown): PatientDetailsDto {
  const o = raw as Record<string, unknown>
  const str = (v: unknown) => (v == null ? "" : String(v).trim())
  const flag = (camel: string, snake: string): boolean | undefined => {
    const v = o[camel] ?? o[snake]
    if (v === true || v === "true") return true
    if (v === false || v === "false") return false
    return undefined
  }
  let birth = ""
  const bd = o.birthDate ?? o.birth_date
  if (bd == null) birth = ""
  else if (typeof bd === "string") birth = bd
  else if (Array.isArray(bd) && bd.length >= 3) {
    const [y, m, d] = bd as unknown[]
    birth = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  }

  return {
    userId: Number(o.userId ?? o.user_id ?? 0),
    name: str(o.name),
    phone: str(o.phone),
    gender: str(o.gender),
    birthDate: birth,
    emergencyContact: str(o.emergencyContact ?? o.emergency_contact),
    bloodType: str(o.bloodType ?? o.blood_type),
    address: str(o.address),
    insuranceInfo: str(o.insuranceInfo ?? o.insurance_info),
    allergies: str(o.allergies),
    patientDetailsRegistered: flag("patientDetailsRegistered", "patient_details_registered"),
  }
}

function normalizeMyProfile(raw: unknown): MyPatientProfileDto {
  const d = raw as Record<string, unknown>
  const pick = (camel: string, snake: string) => {
    const v = d[camel] ?? d[snake]
    if (v == null) return null
    const t = String(v).trim()
    return t === "" ? null : t
  }

  return {
    name: String(d.name ?? "").trim(),
    email: String(d.email ?? "").trim(),
    phone: String(d.phone ?? "").trim(),
    gender: pick("gender", "gender"),
    birthDate:
      d.birthDate == null
        ? null
        : typeof d.birthDate === "string"
          ? (d.birthDate as string)
          : null,
    bloodType: pick("bloodType", "blood_type"),
    insuranceInfo: pick("insuranceInfo", "insurance_info"),
    allergies: pick("allergies", "allergies"),
  }
}

export const PatientService = {
  async getMyProfile(): Promise<MyPatientProfileDto> {
    const res = await api.get("/api/patients/my")
    return normalizeMyProfile(res.data)
  },

  async getAll(): Promise<PatientDetailsDto[]> {
    const res = await api.get("/api/patients")
    const raw = res.data
    if (!Array.isArray(raw)) return []
    return raw.map((item) => normalizeStaffPatientLookup(item as Record<string, unknown>))
  },

  async getById(userId: number): Promise<PatientDetailsDto> {
    const res = await api.get(`/api/patients/${userId}`)
    return res.data
  },

  async getLookupForStaff(userId: number): Promise<PatientDetailsDto> {
    const res = await api.get(`/api/patients/${userId}/lookup`)
    return normalizeStaffPatientLookup(res.data)
  },
}
