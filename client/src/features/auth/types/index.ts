import type { RoleType } from "../../../shared/constants/role.const"

export interface AuthUser {
  id: string
  name?: string
  email: string
  role: RoleType
  avatar?: string
  isNewUser?: boolean
  isVerified: boolean
  onboardingStep?: number
  walletBalance?: number
  authProvider?: string
}

export interface LoginState {
  success?: boolean
  message?: string
  email?: string
  errors?: {
    email?: string[]
    password?: string[]
  }
  user?: AuthUser
}

export interface SignupState {
  success?: boolean
  message?: string
  name?: string
  email?: string
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
}

export interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  forgotEmail?: string
  otp?: string
}

export interface AuthFormStore {
  name: string
  email: string
  password: string
  confirmPassword: string
  otpDigits: string[]
  forgotEmail: string
  errors: FormErrors
  setField: (
    field: "name" | "email" | "password" | "confirmPassword" | "forgotEmail",
    value: string
  ) => void
  setOtpDigit: (index: number, value: string) => void
  setOtpDigits: (digits: string[]) => void
  setError: (field: keyof FormErrors, message: string) => void
  clearError: (field: keyof FormErrors) => void
  clearErrors: () => void
  resetForm: () => void
  validateLogin: () => boolean
  validateSignup: () => boolean
  validateForgotPassword: () => boolean
}
