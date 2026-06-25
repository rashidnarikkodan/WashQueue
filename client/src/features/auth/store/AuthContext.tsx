import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "provider" | "customer";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  setupAccount: (role: "customer" | "provider") => Promise<boolean>;
  logout: () => void;
  cycleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Temp state during multi-step registration flow
  const [tempUser, setTempUser] = useState<{ name: string; email: string } | null>(null);

  // Initialize and check localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("wq_user");
      const storedAuth = localStorage.getItem("wq_auth");
      if (storedUser && storedAuth === "true") {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Failed to load auth state:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("Simulating login validation for password length:", password.length);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simple mock logic:
    // If admin@washqueue.com -> admin
    // If manager@washqueue.com -> manager
    // If provider@washqueue.com -> provider
    // Else -> customer
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

    setUser(loggedInUser);
    setIsAuthenticated(true);
    localStorage.setItem("wq_user", JSON.stringify(loggedInUser));
    localStorage.setItem("wq_auth", "true");
    setIsLoading(false);
    toast.success(`Welcome back, ${loggedInUser.name}!`);
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("Simulating registration details for password length:", password.length);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Save temporary state during verification
    setTempUser({ name, email });
    setIsLoading(false);
    toast.success("Verification OTP code sent successfully!");
    return true;
  };

  const verifyOTP = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (code === "111111" || code.length === 6) { // accept any 6 digits for simulation
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    toast.error("Invalid verification code. Try again.");
    return false;
  };

  const setupAccount = async (role: "customer" | "provider"): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const finalUser: User = {
      id: Math.random().toString(36).substring(7),
      name: tempUser?.name || "New User",
      email: tempUser?.email || "user@washqueue.com",
      role,
    };

    setUser(finalUser);
    setIsAuthenticated(true);
    localStorage.setItem("wq_user", JSON.stringify(finalUser));
    localStorage.setItem("wq_auth", "true");
    setIsLoading(false);
    toast.success("Account setup completed!");
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("wq_user");
    localStorage.removeItem("wq_auth");
    toast.info("Logged out successfully.");
  };

  const cycleRole = () => {
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
    setUser(updated);
    localStorage.setItem("wq_user", JSON.stringify(updated));
    toast.success(`Switched role context to: ${nextRole}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyOTP,
        setupAccount,
        logout,
        cycleRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
