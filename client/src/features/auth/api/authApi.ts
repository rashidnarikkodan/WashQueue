import type { User } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to retrieve auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("wq_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const authApi = {
  /**
   * Send login credentials to backend
   */
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to login");
    }

    return response.json();
  },

  /**
   * Send sign up details to backend
   */
  register: async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Registration failed");
    }

    return response.json();
  },

  /**
   * Verify verification OTP code
   */
  verifyOTP: async (email: string, code: string): Promise<{ success: boolean; user?: User; token?: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "OTP verification failed");
    }

    return response.json();
  },

  /**
   * Update role configuration during account setup
   */
  setupAccount: async (role: "user" | "provider"): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/setup-account`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Account setup failed");
    }

    return response.json();
  },

  /**
   * Inform backend of logout (optional)
   */
  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.warn("Logout request to backend failed or was ignored:", e);
    }
  }
};
