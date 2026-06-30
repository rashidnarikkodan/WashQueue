import { RoleType } from "@/shared/constants/role.constants"

export interface SetupAccountResponse {
  user: {
    id: string
    name?: string
    email: string
    role: RoleType
    isVerified: boolean
  }
}
