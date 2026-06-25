import { create } from "zustand";
import { toast } from "sonner";
import { authApi } from "../api/authApi";

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
  register: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  setupAccount: (role: "user" | "provider") => Promise<boolean>;
  logout: () => void;
  cycleRole: () => void;
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
      // 1. Attempt API login
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
      console.warn("Backend API connection failed, falling back to mock mode:", e.message);
      
      // 2. Simulated Mock Fallback
      await new Promise((resolve) => setTimeout(resolve, 600));

      let role: "admin" | "manager" | "provider" | "user" = "user";
      let name = "Rashid Narikkodan";

      if (email.startsWith("admin")) {
        role = "admin";
        name = "Admin User";
      } else if (email.startsWith("manager")) {
        role = "manager";
        name = "Manager User";
      } else if (email.startsWith("provider")) {
        role = "provider";
        name = "Provider User";
      }

      const loggedInUser: User = {
        id: Math.random().toString(36).substring(7),
        name,
        email,
        role,
      };

      set({
        user: loggedInUser,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("wq_user", JSON.stringify(loggedInUser));
      localStorage.setItem("wq_token", "mock-session-token");
      localStorage.setItem("wq_auth", "true");
      toast.success(`Welcome back, ${loggedInUser.name}! (Simulated)`);
      return true;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    
    try {
      // 1. Attempt API registration
      await authApi.register(name, email, password);
      set({
        tempUser: { name, email },
        isLoading: false,
      });
      toast.success("Verification OTP code sent successfully!");
      return true;
    } catch (e: any) {
      console.warn("Backend API connection failed, falling back to mock mode:", e.message);
      
      // 2. Simulated Mock Fallback
      await new Promise((resolve) => setTimeout(resolve, 800));
      set({
        tempUser: { name, email },
        isLoading: false,
      });
      
      toast.success("Verification OTP code sent successfully! (Simulated)");
      return true;
    }
  },

  verifyOTP: async (code) => {
    set({ isLoading: true });
    const tempUser = get().tempUser;
    const email = tempUser?.email || "user@washqueue.com";

    try {
      // 1. Attempt API verification
      const data = await authApi.verifyOTP(email, code);
      if (data.success) {
        if (data.user && data.token) {
          // If backend directly completes session on verify
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem("wq_user", JSON.stringify(data.user));
          localStorage.setItem("wq_token", data.token);
          localStorage.setItem("wq_auth", "true");
        } else {
          set({ isLoading: false });
        }
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (e: any) {
      console.warn("Backend API connection failed, falling back to mock mode:", e.message);
      
      // 2. Simulated Mock Fallback
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (code === "111111" || code.length === 6) {
        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false });
      toast.error("Invalid verification code. Try again.");
      return false;
    }
  },

  setupAccount: async (role) => {
    set({ isLoading: true });
    
    try {
      // 1. Attempt API setup
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
      console.warn("Backend API connection failed, falling back to mock mode:", e.message);
      
      // 2. Simulated Mock Fallback
      await new Promise((resolve) => setTimeout(resolve, 500));

      const tempUser = get().tempUser;
      const finalUser: User = {
        id: Math.random().toString(36).substring(7),
        name: tempUser?.name || "New User",
        email: tempUser?.email || "user@washqueue.com",
        role,
      };

      set({
        user: finalUser,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("wq_user", JSON.stringify(finalUser));
      localStorage.setItem("wq_token", "mock-session-token");
      localStorage.setItem("wq_auth", "true");
      toast.success("Account setup completed! (Simulated)");
      return true;
    }
  },

  logout: () => {
    // Attempt API logout background request
    authApi.logout();

    // Clear client session details
    set({
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("wq_user");
    localStorage.removeItem("wq_token");
    localStorage.removeItem("wq_auth");
    toast.info("Logged out successfully.");
  },

  cycleRole: () => {
    const user = get().user;
    if (!user) return;
    
    let nextRole: "admin" | "manager" | "provider" | "user";
    if (user.role === "user") {
      nextRole = "admin";
    } else if (user.role === "admin") {
      nextRole = "manager";
    } else if (user.role === "manager") {
      nextRole = "provider";
    } else {
      nextRole = "user";
    }

    const updated = { ...user, role: nextRole };
    set({ user: updated });
    localStorage.setItem("wq_user", JSON.stringify(updated));
    toast.success(`Switched role context to: ${nextRole}`);
  },
}));
