import { create } from "zustand";
import type { AuthFormStore, FormErrors } from "../types";

export const useAuthFormStore = create<AuthFormStore>((set, get) => ({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  otpDigits: Array(6).fill(""),
  forgotEmail: "",
  errors: {},

  setField: (field, value) => set({ [field]: value }),

  setOtpDigit: (index, value) => set((state) => {
    const nextDigits = [...state.otpDigits];
    nextDigits[index] = value;
    return { otpDigits: nextDigits };
  }),

  setOtpDigits: (digits) => set({ otpDigits: digits }),

  setError: (field, message) => set((state) => ({
    errors: { ...state.errors, [field]: message }
  })),

  clearError: (field) => set((state) => {
    const nextErrors = { ...state.errors };
    delete nextErrors[field];
    return { errors: nextErrors };
  }),

  clearErrors: () => set({ errors: {} }),

  resetForm: () => set({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otpDigits: Array(6).fill(""),
    forgotEmail: "",
    errors: {},
  }),

  validateLogin: () => {
    const { email, password } = get();
    const errors: FormErrors = {};
    let isValid = true;

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    set({ errors });
    return isValid;
  },

  validateSignup: () => {
    const { name, email, password, confirmPassword } = get();
    const errors: FormErrors = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    set({ errors });
    return isValid;
  },

  validateForgotPassword: () => {
    const { forgotEmail } = get();
    const errors: FormErrors = {};
    let isValid = true;

    if (!forgotEmail) {
      errors.forgotEmail = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      errors.forgotEmail = "Please enter a valid email address";
      isValid = false;
    }

    set({ errors });
    return isValid;
  },
}));
