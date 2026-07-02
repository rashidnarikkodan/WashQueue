import { api } from "../../../shared/config/axios"
import type { RoleType } from "../../../shared/constants/role.const"
import { API_ROUTES } from "../../../shared/constants/route.const"
import { handleApiError } from "../../../shared/utils/handleApiError"
import type { User } from "../types"

interface AuthApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

interface AuthUserPayload {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: User["role"];
  isNewUser?: boolean;
}

const toUserPayload = (data: unknown): AuthUserPayload | undefined => {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const payload = data as Record<string, unknown>;
  const id = typeof payload.id === "string"
    ? payload.id
    : typeof payload._id === "string"
      ? payload._id
      : undefined;

  if (!id && typeof payload.name !== "string" && typeof payload.email !== "string" && typeof payload.role !== "string") {
    return undefined;
  }

  return {
    id,
    _id: typeof payload._id === "string" ? payload._id : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
    email: typeof payload.email === "string" ? payload.email : undefined,
    role: typeof payload.role === "string" ? (payload.role as User["role"]) : undefined,
    isNewUser: typeof payload.isNewUser === "boolean" ? payload.isNewUser : undefined,
  };
};

export const authApi = {
  /**
   * Send login credentials to backend
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, { email, password },{skipToast:true})
      const resJson = response.data as AuthApiResponse
      const payload = toUserPayload(resJson.data)

      return {
        id: payload?.id ?? "",
        name: payload?.name ?? "",
        email: payload?.email ?? "",
        role: payload?.role ?? "customer"
      }
    } catch (error: unknown) {
      handleApiError(error, "Failed to login")
    }
  },
  
  /**
   * Exchange Google ID Token for local credentials
   */
  loginWithGoogle: async (token: string): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.GOOGLE, { token }, { skipToast: true })
      const resJson = response.data as AuthApiResponse
      const payload = toUserPayload(resJson.data)

      return {
        id: payload?.id ?? "",
        name: payload?.name ?? "",
        email: payload?.email ?? "",
        role: payload?.role ?? "customer",
        isNewUser: payload?.isNewUser
      }
    } catch (error: unknown) {
      handleApiError(error, "Google Sign-In failed")
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
      handleApiError(error, "Registration failed")
    }
  },

  /**
   * Verify verification OTP code
   */
  verifyOTP: async (email: string, code: string): Promise<User | undefined> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.VERIFY_OTP, { email, code }, { skipToast: true })
      const resJson = response.data
      const payload = resJson.data

      if (!resJson.success || !payload) {
        return undefined
      }

      return {
        id: resJson.data.id || resJson.data._id,
        name: resJson.data.name,
        email: resJson.data.email,
        role: resJson.data.role
      }
    } catch (error: unknown) {
      handleApiError(error, "OTP verification failed")
    }
  },

  /**
   * Update role configuration during account setup
  */
  setupAccount: async (role: RoleType): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.SETUP_ACCOUNT, { role }, { skipToast: true })
      const resJson = response.data as AuthApiResponse
      const payload = toUserPayload((resJson.data as { user?: unknown } | undefined)?.user ?? resJson.data)

      return {
        id: payload?.id ?? "",
        name: payload?.name ?? "",
        email: payload?.email ?? "",
        role: payload?.role ?? "customer"
      }
    } catch (error: unknown) {
      handleApiError(error, "Account setup failed")
    }
  },

  me: async (): Promise<User> => {
    try {
      const response = await api.get(API_ROUTES.AUTH.ME, { skipToast: true })
      const resJson = response.data as AuthApiResponse
      const payload = toUserPayload(resJson.data)

      return {
        id: payload?.id ?? "",
        name: payload?.name ?? "",
        email: payload?.email ?? "",
        role: payload?.role ?? "customer"
      }
    } catch (error: unknown) {
      handleApiError(error, "Failed to fetch user session")
    }
  },

  /**
   * Inform backend of logout (optional)
   */
  logout: async (): Promise<void> => {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT)
    } catch (error:unknown) {
      handleApiError(error, "Logout request to backend failed or was ignored:")
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
      handleApiError(error, "Failed to send reset code")
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
      handleApiError(error, "Failed to reset password")
    }
  }
}
