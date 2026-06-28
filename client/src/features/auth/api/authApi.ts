import type { User } from "../store/authStore"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

const mapServerRoleToClient = (role: string): "admin" | "manager" | "provider" | "user" => {
  const r = role.toUpperCase()
  if (r === "CUSTOMER" || r === "USER") return "user"
  if (r === "PROVIDER") return "provider"
  if (r === "ADMIN") return "admin"
  if (r === "MANAGER") return "manager"
  return "user"
}

// Helper to retrieve auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("wq_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export const authApi = {
  /**
   * Send login credentials to backend
   */
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const resJson = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(resJson.message || "Failed to login")
    }

    return {
      user: {
        id: resJson.data.user.id || resJson.data.user._id,
        name: resJson.data.user.name,
        email: resJson.data.user.email,
        role: mapServerRoleToClient(resJson.data.user.role)
      },
      token: resJson.data.tokens.accessToken
    }
  },

  /**
   * Exchange Google ID Token for local credentials
   */
  loginWithGoogle: async (token: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })

    const resJson = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(resJson.message || "Google Sign-In failed")
    }

    return {
      user: {
        id: resJson.data.user.id || resJson.data.user._id,
        name: resJson.data.user.name,
        email: resJson.data.user.email,
        role: mapServerRoleToClient(resJson.data.user.role)
      },
      token: resJson.data.tokens.accessToken
    }
  },

  /**
   * Send sign up details to backend
   */
  register: async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    })

    const resJson = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(resJson.message || "Registration failed")
    }

    return {
      success: resJson.success,
      message: resJson.message
    }
  },

  /**
   * Verify verification OTP code
   */
  verifyOTP: async (email: string, code: string): Promise<{ success: boolean; user?: User; token?: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    })

    const resJson = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(resJson.message || "OTP verification failed")
    }

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
  },

  /**
   * Update role configuration during account setup
   */
  setupAccount: async (role: "user" | "provider"): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/setup-account`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    })

    const resJson = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(resJson.message || "Account setup failed")
    }

    return {
      user: {
        id: resJson.data.user.id || resJson.data.user._id,
        name: resJson.data.user.name,
        email: resJson.data.user.email,
        role: mapServerRoleToClient(resJson.data.user.role)
      }
    }
  },

  /**
   * Inform backend of logout (optional)
   */
  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders()
      })
    } catch (e) {
      console.warn("Logout request to backend failed or was ignored:", e)
    }
  }
}

