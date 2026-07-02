import type { User } from "../store/authStore"
import { api } from "../../../shared/config/axios"
import { ROLE, type RoleType } from "../../../shared/constants/role.const"
import { API_ROUTES } from "../../../shared/constants/route.const"
import { getErrorMessage } from "../../../shared/utils/error"

interface AuthResponseData {
  id?: string
  _id?: string
  name?: string
  email?: string
  role?: RoleType
  isNewUser?: boolean
  user?: unknown
}

interface AuthApiResponse {
  success?: boolean
  message?: string
  data?: AuthResponseData | unknown
}

const toUser = (payload?: AuthResponseData): User => ({
  id: payload?.id ?? payload?._id ?? "",
  name: payload?.name ?? "",
  email: payload?.email ?? "",
  role: payload?.role ?? ROLE.CUSTOMER,
  isNewUser: payload?.isNewUser,
})

const toUserPayload = (value: unknown): AuthResponseData | undefined => {
  if (typeof value === "object" && value !== null) {
    return value as AuthResponseData
  }

  return undefined
}

export const authApi = {
  /**
   * Send login credentials to backend
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, { email, password },{skipToast:true})
      const resJson = response.data as AuthApiResponse
      const payload = toUserPayload(resJson.data)

      return toUser(payload)
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to login")
      throw new Error(message)
    }
  },

  /**
   * Exchange Google ID Token for local credentials
   */
  loginWithGoogle: async (token: string): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.GOOGLE, { token }, { skipToast: true })
      const resJson = response.data as AuthApiResponse

      return toUser(toUserPayload(resJson.data))
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Google Sign-In failed")
      throw new Error(message)
    }
  },

  /**
   * Send sign up details to backend
   */
  signup: async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.SIGNUP, { name, email, password }, { skipToast: true })
      const resJson = response.data as AuthApiResponse

      return {
        success: Boolean(resJson.success),
        message: resJson.message ?? "Registration successful"
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Registration failed")
      throw new Error(message)
    }
  },

  /**
   * Verify verification OTP code
   */
  verifyOTP: async (email: string, code: string): Promise<User | undefined> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.VERIFY_OTP, { email, code }, { skipToast: true })
      const resJson = response.data as AuthApiResponse
      const payload = toUserPayload(resJson.data)

      if (!resJson.success || !payload) {
        return undefined
      }

      return toUser(payload)
    } catch (error: unknown) {
      const message = getErrorMessage(error, "OTP verification failed")
      throw new Error(message)
    }
  },

  
   // Update role configuration during account setup 
  setupAccount: async (role: RoleType): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.SETUP_ACCOUNT, { role }, { skipToast: true })
      const resJson = response.data as AuthApiResponse
      const payload = toUserPayload(resJson.data)
      const nestedPayload = toUserPayload(payload?.user)

      return toUser(nestedPayload ?? payload)
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Account setup failed")
      throw new Error(message)
    }
  },

  me: async (): Promise<User> => {
    try {
      const response = await api.get(API_ROUTES.AUTH.ME, { skipToast: true })
      const resJson = response.data as AuthApiResponse
      const payload = toUserPayload(resJson.data)

      return toUser(payload)
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to fetch user session")
      throw new Error(message)
    }
  },

  /**
   * Inform backend of logout (optional)
   */
  logout: async (): Promise<void> => {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT)
    } catch (e) {
      console.warn("Logout request to backend failed or was ignored:", e)
    }
  },

  /**
   * Request forgot password OTP
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email }, { skipToast: true })
      const resJson = response.data as AuthApiResponse
      return {
        success: Boolean(resJson.success),
        message: resJson.message ?? "Please check your email"
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to send reset code")
      throw new Error(message)
    }
  },

  /**
   * Reset password with OTP and new password
   */
  resetPassword: async (email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.RESET_PASSWORD, { email, code, password: newPassword }, { skipToast: true })
      const resJson = response.data as AuthApiResponse
      return {
        success: Boolean(resJson.success),
        message: resJson.message ?? "Password reset completed"
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to reset password")
      throw new Error(message)
    }
  }
}
