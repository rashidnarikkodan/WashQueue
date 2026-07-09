export const API_ROUTES = {
  BASE: "/api",
  AUTH: {
    ROOT: "/api/auth",
    SIGNUP: "/signup",
    LOGIN: "/login",
    VERIFY_OTP: "/verify-otp",
    GOOGLE: "/google",
    REFRESH_TOKEN: "/refresh-token",
    SETUP_ACCOUNT: "/setup-account",
    ME: "/me",
    LOGOUT: "/logout",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },
  USERS: {
    ROOT: "/api/users",
    GET_ALL: "/",
    GET_BY_ID: "/:id",
    UPDATE: "/:id",
  },
  OWNER: {
    ROOT: "/api/owners",
    CREATE: "/",
    GET_PROFILE: "/me",
    UPDATE_PROFILE: "/me",
  },
} as const
