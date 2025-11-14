import { QuestionType, QuestionCategory } from "@prisma/client"

export interface FormQuestion {
  id: string
  key: string
  label: string
  type: QuestionType
  category: QuestionCategory
  required: boolean
  order: number
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  helpText?: string
  placeholder?: string
  customLabel?: string
  locked?: boolean // Core questions are locked
}

export interface FormStep {
  step: number
  title: string
  questions: FormQuestion[]
}

export interface LeadSubmissionData {
  // Mandatory fields
  firstName: string
  lastName: string
  phone: string
  email: string
  zip: string
  state: string
  dob: string
  tobaccoUse: boolean
  coverageStartPreference: string
  peopleNeedingCoverage: number
  
  // Optional fields
  gender?: string
  householdIncome?: string
  currentCoverage?: string
  deductiblePreference?: string
  carrierPreference?: string
  dentalVisionPreference?: string
  medications?: string
  employmentStatus?: string
  
  // Custom answers (key-value pairs)
  customAnswers?: Record<string, any>
  
  // Agent ID (optional, may be determined by routing)
  agentId?: string
}

