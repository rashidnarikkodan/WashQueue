export interface SignupInput {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export interface SignupResponse {
  id: string
  name?: string
  email: string
  role: string
  isVerified: boolean
}
