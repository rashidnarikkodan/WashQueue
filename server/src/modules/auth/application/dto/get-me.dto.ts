export interface GetMeResponse {
  user: {
    id: string
    name?: string
    email: string
    phone?: string
    role: string
    avatar?: string
    walletBalance: number
    isVerified: boolean
  }
}
