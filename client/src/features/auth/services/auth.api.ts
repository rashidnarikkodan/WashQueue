import type { User } from "../store/authStore"
import { api } from "../../../shared/config/axios"
import type { RoleType } from "../../../shared/constants/role.const"

export const authApi = {
  /**
   * Send login credentials to backend
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post("/auth/login", { email, password })
      const resJson = response.data
      
      return {
          id: resJson.data.user.id || resJson.data.user._id,
          name: resJson.data.user.name,
          email: resJson.data.user.email,
          role: resJson.data.user.role
        }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to login"
      throw new Error(message)
    }
  },

  /**
   * Exchange Google ID Token for local credentials
   */
  loginWithGoogle: async (token: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post("/auth/google", { token })
      const resJson = response.data

      return {
        user: {
          id: resJson.data.user.id || resJson.data.user._id,
          name: resJson.data.user.name,
          email: resJson.data.user.email,
          role: resJson.data.user.role
        },
        token: resJson.data.tokens.accessToken
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
      const response = await api.post("/auth/signup", { name, email, password })
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
  verifyOTP: async (email: string, code: string): Promise<{ success: boolean; user?: User; token?: string }> => {
    try {
      const response = await api.post("/auth/verify-otp", { email, code })
      const resJson = response.data

      return {
        success: resJson.success,
        user: resJson.data.user ? {
          id: resJson.data.user.id || resJson.data.user._id,
          name: resJson.data.user.name,
          email: resJson.data.user.email,
          role: mapServerRoleToClient(resJson.data.user.role)
        } : undefined,
        token: resJson.data.tokens?.accessToken
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "OTP verification failed"
      throw new Error(message)
    }
  },

  /**
   * Update role configuration during account setup
   */
  setupAccount: async (role:RoleType): Promise<{ user: User }> => {
    try {
      const response = await api.post("/auth/setup-account", { role })
      const resJson = response.data

      return {
        user: {
          id: resJson.data.user.id || resJson.data.user._id,
          name: resJson.data.user.name,
          email: resJson.data.user.email,
          role: mapServerRoleToClient(resJson.data.user.role)
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Account setup failed"
      throw new Error(message)
    }
  },

  /**
   * Inform backend of logout (optional)
   */
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout")
    } catch (e) {
      console.warn("Logout request to backend failed or was ignored:", e)
    }
  }
}
