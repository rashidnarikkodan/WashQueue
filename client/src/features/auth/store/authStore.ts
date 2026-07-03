import { create } from "zustand";
import { toast } from "sonner";
import { authApi } from "../services/auth.api";
import type { RoleType } from "../../../shared/constants/role.const";
import { getErrorMessage } from "../../../shared/utils/error";
import type { AuthUser } from "../types";

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tempUser: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (token: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  setupAccount: (role: RoleType) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
}

const getInitialState = () => {
  try {
    const storedUser = localStorage.getItem("wq_user");
    const storedAuth = localStorage.getItem("wq_auth");
    if (storedUser && storedAuth === "true") {
      return {
        user: JSON.parse(storedUser) as AuthUser,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.error("Failed to load stored auth state:", e);
  }
  return {
    user: null,
    isAuthenticated: false,
  };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: initialState.user,
  isAuthenticated: initialState.isAuthenticated,
  isLoading: false,
  tempUser: null,

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const user = await authApi.login(email, password);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem("wq_user", JSON.stringify(user));
      localStorage.setItem("wq_auth", "true");
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Login failed"));
      set({ isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async (token) => {
    set({ isLoading: true });

    try {
      const loggedInUser = await authApi.loginWithGoogle(token);

      set({
        user: loggedInUser,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("wq_user", JSON.stringify(loggedInUser));
      localStorage.setItem("wq_auth", "true");
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return true;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Google sign-in failed"));
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });

    try {
      await authApi.signup(name, email, password);
      set({
        tempUser: { name, email },
        isLoading: false,
      });
      localStorage.setItem("wq_temp_email", email);
      toast.success("Verification OTP code sent successfully!");
      return true;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Registration failed"));
      set({ isLoading: false });
      return false;
    }
  },

  verifyOTP: async (code) => {
    set({ isLoading: true });
    const tempUser = get().tempUser;
    const email = tempUser?.email || localStorage.getItem("wq_temp_email");
    if (!email) {
      toast.error("Verification email context not found. Please signup again.");
      set({ isLoading: false });
      return false;
    }

    try {
      const user = await authApi.verifyOTP(email, code);
      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          tempUser: null,
        });
        localStorage.setItem("wq_user", JSON.stringify(user));
        localStorage.setItem("wq_auth", "true");
        localStorage.removeItem("wq_temp_email");
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "OTP verification failed"));
      set({ isLoading: false });
      return false;
    }
  },

  setupAccount: async (role) => {
    set({ isLoading: true });

    try {
      const finalUser = await authApi.setupAccount(role);

      set({
        user: finalUser,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem("wq_user", JSON.stringify(finalUser));
      localStorage.setItem("wq_auth", "true");
      toast.success("Account setup completed!");
      return true;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Account setup failed"));
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await authApi.logout();

    set({
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("wq_user");
    localStorage.removeItem("wq_auth");
    localStorage.removeItem("wq_token");
    localStorage.removeItem("wq_temp_email");
    localStorage.removeItem("wq_reset_email");
    toast.info("Logged out successfully.");
  },

  forgotPassword: async (email) => {
    set({ isLoading: true });
    try {
      await authApi.forgotPassword(email);
      set({ isLoading: false });
      localStorage.setItem("wq_reset_email", email);
      return true;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to send verification code"));
      set({ isLoading: false });
      return false;
    }
  },

  resetPassword: async (email, code, newPassword) => {
    set({ isLoading: true });
    try {
      await authApi.resetPassword(email, code, newPassword);
      set({ isLoading: false });
      localStorage.removeItem("wq_reset_email");
      return true;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to reset password"));
      set({ isLoading: false });
      return false;
    }
  },
}));
