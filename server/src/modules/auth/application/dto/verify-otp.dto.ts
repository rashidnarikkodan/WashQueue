export interface VerifyOtpInput {
  email: string
  otp: string
}

export interface VerifyOtpResponse {
  user: {
    id: string
    name?: string
    email: string
    role: string
    isVerified: boolean
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
