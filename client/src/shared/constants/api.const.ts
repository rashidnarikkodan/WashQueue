export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    GOOGLE: "/auth/google",
    SIGNUP: "/auth/signup",
    VERIFY_OTP: "/auth/verify-otp",
    SETUP_ACCOUNT: "/auth/setup-account",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh-token",
  },
  USERS: {
    ROOT: "/users",
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const