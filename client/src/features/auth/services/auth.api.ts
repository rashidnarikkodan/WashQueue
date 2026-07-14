import type { User } from "../store/authStore"
import { api } from "../../../shared/config/axios"
import type { RoleType } from "../../../shared/constants/role.const"
import { API_ROUTES } from "../../../shared/constants/route.const"

export const authApi = {
  /**
   * Send login credentials to backend
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, { email, password },{skipToast:true})
      const resJson = response.data

      return {
        id: resJson.data.id || resJson.data._id,
        name: resJson.data.name,
        email: resJson.data.email,
        role: resJson.data.role,
        isVerified: resJson.data.isVerified,
        onboardingStep: resJson.data.onboardingStep,
      }
    } catch (error: any) {
      console.log(error)
      const message = error.response?.data?.message || error.message || "Failed to login"
      throw new Error(message)
    }
  },

  /**
   * Exchange Google ID Token for local credentials
   */
  loginWithGoogle: async (token: string): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.GOOGLE, { token }, { skipToast: true })
      const resJson = response.data

      return {
        id: resJson.data.id || resJson.data._id,
        name: resJson.data.name,
        email: resJson.data.email,
        role: resJson.data.role,
        isNewUser: resJson.data.isNewUser,
        isVerified: resJson.data.isVerified,
        onboardingStep: resJson.data.onboardingStep,
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Google Sign-In failed"
      throw new Error(message)
    }
  },

  /**
   * Send sign up details to backend
   */
  signup: async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.SIGNUP, { name, email, password }, { skipToast: true })
      const resJson = response.data

      return {
        success: resJson.success,
        message: resJson.message
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Registration failed"
      throw new Error(message)
    }
  },

  /**
   * Verify verification OTP code
   */
  verifyOTP: async (email: string, code: string): Promise<User | undefined> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.VERIFY_OTP, { email, code }, { skipToast: true })
      const resJson = response.data

      if (!resJson.success || !resJson.data) {
        return undefined
      }

      return {
        id: resJson.data.id || resJson.data._id,
        name: resJson.data.name,
        email: resJson.data.email,
        role: resJson.data.role,
        isVerified: resJson.data.isVerified,
        onboardingStep: resJson.data.onboardingStep,
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "OTP verification failed"
      throw new Error(message)
    }
  },

  /**
   * Update role configuration during account setup
   */
  setupAccount: async (role: RoleType): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.SETUP_ACCOUNT, { role }, { skipToast: true })
      const resJson = response.data
      const userData = resJson.data?.user || resJson.data

      return {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isVerified: userData.isVerified,
        onboardingStep: userData.onboardingStep,
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Account setup failed"
      throw new Error(message)
    }
  },

  me: async (): Promise<User> => {
    try {
      const response = await api.get(API_ROUTES.AUTH.ME, { skipToast: true })
      const resJson = response.data

      return {
        id: resJson.data.id || resJson.data._id,
        name: resJson.data.name,
        email: resJson.data.email,
        role: resJson.data.role,
        isVerified: resJson.data.isVerified,
        onboardingStep: resJson.data.onboardingStep,
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to fetch user session"
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
      const resJson = response.data
      return {
        success: resJson.success,
        message: resJson.message
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to send reset code"
      throw new Error(message)
    }
  },

  /**
   * Reset password with OTP and new password
   */
  resetPassword: async (email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.RESET_PASSWORD, { email, code, password: newPassword }, { skipToast: true })
      const resJson = response.data
      return {
        success: resJson.success,
        message: resJson.message
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to reset password"
      throw new Error(message)
    }
  }
}
