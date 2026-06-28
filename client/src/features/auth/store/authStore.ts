import { create } from "zustand";
import { toast } from "sonner";
import { authApi } from "../services/auth.api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "provider" | "user";
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tempUser: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (token: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  setupAccount: (role: "user" | "provider") => Promise<boolean>;
  logout: () => void;
}

const getInitialState = () => {
  try {
    const storedUser = localStorage.getItem("wq_user");
    const storedAuth = localStorage.getItem("wq_auth");
    if (storedUser && storedAuth === "true") {
      return {
        user: JSON.parse(storedUser) as User,
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
      const data = await authApi.login(email, password);
      const loggedInUser = data.user;
      
      set({
        user: loggedInUser,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("wq_user", JSON.stringify(loggedInUser));
      localStorage.setItem("wq_token", data.token);
      localStorage.setItem("wq_auth", "true");
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return true;
    } catch (e: any) {
      toast.error(e.message)
      set({ isLoading: false });
      return false
    }
  },

  loginWithGoogle: async (token) => {
    set({ isLoading: true });
    
    try {
      const data = await authApi.loginWithGoogle(token);
      const loggedInUser = data.user;
      
      set({
        user: loggedInUser,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("wq_user", JSON.stringify(loggedInUser));
      localStorage.setItem("wq_token", data.token);
      localStorage.setItem("wq_auth", "true");
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return true;
    } catch (e: any) {
      toast.error(e.message)
      set({ isLoading: false });
      return false
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    
    try {
      await authApi.register(name, email, password);
      set({
        tempUser: { name, email },
        isLoading: false,
      });
      localStorage.setItem("wq_temp_email", email);
      toast.success("Verification OTP code sent successfully!");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      set({ isLoading: false });
      return false;
    }
  },

  verifyOTP: async (code) => {
    set({ isLoading: true });
    const tempUser = get().tempUser;
    const email = tempUser?.email || localStorage.getItem("wq_temp_email");
    if (!email) {
      toast.error("Verification email context not found. Please register again.");
      set({ isLoading: false });
      return false;
    }

    try {
      const data = await authApi.verifyOTP(email, code);
      if (data.success) {
        if (data.user && data.token) {
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            tempUser: null,
          });
          localStorage.setItem("wq_user", JSON.stringify(data.user));
          localStorage.setItem("wq_token", data.token);
          localStorage.setItem("wq_auth", "true");
        } else {
          set({ isLoading: false });
        }
        localStorage.removeItem("wq_temp_email");
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (e: any) {
      toast.error(e.message || "OTP verification failed");
      set({ isLoading: false });
      return false;
    }
  },

  setupAccount: async (role) => {
    set({ isLoading: true });
    
    try {
      const data = await authApi.setupAccount(role);
      const finalUser = data.user;
      
      set({
        user: finalUser,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("wq_user", JSON.stringify(finalUser));
      localStorage.setItem("wq_auth", "true");
      toast.success("Account setup completed!");
      return true;
    } catch (e: any) {
      toast.error(e.message || "Account setup failed");
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    authApi.logout();

    set({
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("wq_user");
    localStorage.removeItem("wq_token");
    localStorage.removeItem("wq_auth");
    localStorage.removeItem("wq_temp_email");
    toast.info("Logged out successfully.");
  },
}));
