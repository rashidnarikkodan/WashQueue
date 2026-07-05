import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import type { RoleType } from "@/shared/constants/role.const"

import type { ApiResponse } from "@/shared/types/ApiResponse"

import { asyncHandle } from "@/shared/utils/asyncHandle"

import type { AuthUser } from "../types"

const unwrap = <T>(response: ApiResponse<T>): T => {
  return response.data
}

export const authApi = {

  login: asyncHandle(
    async (email: string, password: string): Promise<AuthUser> => {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, { email, password }, { skipToast: true })
      return unwrap(response.data)
    },
    "Failed to login"
  ),


  loginWithGoogle: asyncHandle(
    async (token: string): Promise<AuthUser> => {
      const response = await api.post(API_ROUTES.AUTH.GOOGLE, { token }, { skipToast: true })
      return unwrap(response.data)
    },
    "Google Sign-In failed"
  ),


  signup: asyncHandle(
    async (name: string, email: string, password: string): Promise<void> => {
      await api.post(API_ROUTES.AUTH.SIGNUP, { name, email, password },
        { skipToast: true, successToast: "Registration successful" }
      )
    },
    "Registration failed"
  ),

  verifyOTP: asyncHandle(
    async (
      email: string,
      code: string
    ): Promise<AuthUser> => {
      const response = await api.post(
        API_ROUTES.AUTH.VERIFY_OTP,
        { email, code },
        { skipToast: true }
      )

      return unwrap(response.data)
    },
    "OTP verification failed"
  ),

  /**
   * Setup account role
   */
  setupAccount: asyncHandle(
    async (role: RoleType): Promise<AuthUser> => {
      const response = await api.post(
        API_ROUTES.AUTH.SETUP_ACCOUNT,
        { role },
        { skipToast: true }
      )

      return unwrap(response.data)
    },
    "Account setup failed"
  ),

  me: asyncHandle(
    async (): Promise<AuthUser> => {
      const response = await api.get(
        API_ROUTES.AUTH.ME,
        { skipToast: true }
      )

      return unwrap(response.data)
    },
    "Failed to fetch user session"
  ),

  logout: asyncHandle(
    async (): Promise<void> => {
      await api.post(
        API_ROUTES.AUTH.LOGOUT,
        {},
        { skipToast: true }
      )
    },
    "Logout failed"
  ),

  forgotPassword: asyncHandle(
    async (email: string): Promise<void> => {
      await api.post(
        API_ROUTES.AUTH.FORGOT_PASSWORD,
        { email },
        {
          skipToast: true,
          successToast: "Please check your email"
        }
      )
    },
    "Failed to send reset code"
  ),

  /**
   * Reset password
   */
  resetPassword: asyncHandle(
    async (
      email: string,
      code: string,
      newPassword: string
    ): Promise<void> => {
      await api.post(
        API_ROUTES.AUTH.RESET_PASSWORD,
        {
          email,
          code,
          password: newPassword
        },
        { skipToast: true }
      )
    },
    "Failed to reset password"
  )
}