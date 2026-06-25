import { create } from "zustand";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "provider" | "customer";
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tempUser: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  setupAccount: (role: "customer" | "provider") => Promise<boolean>;
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
    console.log("Simulating login validation for password length:", password.length);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    let role: "admin" | "manager" | "provider" | "customer" = "customer";
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
    localStorage.setItem("wq_auth", "true");
    toast.success(`Welcome back, ${loggedInUser.name}!`);
    return true;
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    console.log("Simulating registration details for password length:", password.length);
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    set({
      tempUser: { name, email },
      isLoading: false,
    });
    
    toast.success("Verification OTP code sent successfully!");
    return true;
  },

  verifyOTP: async (code) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (code === "111111" || code.length === 6) {
      set({ isLoading: false });
      return true;
    }
    
    set({ isLoading: false });
    toast.error("Invalid verification code. Try again.");
    return false;
  },

  setupAccount: async (role) => {
    set({ isLoading: true });
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
    localStorage.setItem("wq_auth", "true");
    toast.success("Account setup completed!");
    return true;
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("wq_user");
    localStorage.removeItem("wq_auth");
    toast.info("Logged out successfully.");
  },

  cycleRole: () => {
    const user = get().user;
    if (!user) return;
    
    let nextRole: "admin" | "manager" | "provider" | "customer";
    if (user.role === "customer") {
      nextRole = "admin";
    } else if (user.role === "admin") {
      nextRole = "manager";
    } else if (user.role === "manager") {
      nextRole = "provider";
    } else {
      nextRole = "customer";
    }

    const updated = { ...user, role: nextRole };
    set({ user: updated });
    localStorage.setItem("wq_user", JSON.stringify(updated));
    toast.success(`Switched role context to: ${nextRole}`);
  },
}));
