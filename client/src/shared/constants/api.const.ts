export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    GOOGLE: "/auth/google",
    SIGNUP: "/auth/signup",
    VERIFY_OTP: "/auth/verify-otp",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh-token",
    RESEND_OTP: "/auth/resend-otp",
  },
  USERS: {
    ROOT: "/users",
    BOOKMARKS: "/users/bookmarks",
    TOGGLE_BOOKMARK: "/users/bookmarks/toggle",
    BY_ID: (id: string) => `/users/${id}`,
  },
  STATIONS: {
    ROOT: "/stations",
    BY_ID: (id: string) => `/stations/${id}`,
    SUBMIT: (id: string) => `/stations/${id}/submit`,
    REVIEW: (id: string) => `/stations/${id}/review`,
    ASSIGN_MANAGER: (id: string) => `/stations/${id}/assign-manager`,
  },
  VEHICLES: {
    ROOT: "/vehicles",
    BY_ID: (id: string) => `/vehicles/${id}`,
    PRIMARY: (id: string) => `/vehicles/${id}/primary`,
  },
} as const
