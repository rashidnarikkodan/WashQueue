export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
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
