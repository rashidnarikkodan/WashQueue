export interface GoogleAuthResponse {
  user: {
    id: string
    name?: string
    email: string
    role: string
    isVerified: boolean
    isNewUser: boolean
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
