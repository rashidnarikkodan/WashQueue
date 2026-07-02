import type { RoleType } from "../../../shared/constants/role.const";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  isNewUser?: boolean;
  walletBalance?: number;
}

export interface LoginState {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
  user?: User;
  email?: string;
}

export interface SignupState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  email?: string;
  name?: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  forgotEmail?: string;
}

export interface AuthFormStore {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otpDigits: string[];
  forgotEmail: string;
  errors: FormErrors;
  setField: (field: "name" | "email" | "password" | "confirmPassword" | "forgotEmail", value: string) => void;
  setOtpDigit: (index: number, value: string) => void;
  setOtpDigits: (digits: string[]) => void;
  setError: (field: keyof FormErrors, message: string) => void;
  clearError: (field: keyof FormErrors) => void;
  clearErrors: () => void;
  resetForm: () => void;
  validateLogin: () => boolean;
  validateSignup: () => boolean;
  validateForgotPassword: () => boolean;
}
