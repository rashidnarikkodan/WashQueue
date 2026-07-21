export const API_ROUTES = {
  BASE: "/api",
  AUTH: {
    ROOT: "/api/auth",
    SIGNUP: "/signup",
    LOGIN: "/login",
    VERIFY_OTP: "/verify-otp",
    GOOGLE: "/google",
    REFRESH_TOKEN: "/refresh-token",
    ME: "/me",
    LOGOUT: "/logout",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    RESEND_OTP: "/resend-otp",
  },
  USERS: {
    ROOT: "/api/users",
    GET_ALL: "/",
    GET_BY_ID: "/:id",
    UPDATE: "/:id",
  },
  OWNER: {
    ROOT: "/api/owner",
    CREATE: "/",
    GET_PROFILE: "/me",
    UPDATE_PROFILE: "/me",
    ONBOARDING_STATUS: "/onboarding/status",
    ONBOARDING_STEP: "/onboarding/step",
    ONBOARDING_SUBMIT: "/onboarding/submit",
  },
  VEHICLE_CATALOG: {
    ROOT: "/api/vehicle-catalog",
    CATEGORIES: "/categories",
    CATEGORY_BY_ID: "/categories/:id",
    CLASSES: "/classes",
    CLASS_BY_ID: "/classes/:id",
  },
  STATIONS: {
    ROOT: "/api/stations",
  },
  VEHICLES: {
    ROOT: "/api/vehicles",
  },
} as const
