import axios from "axios"
import { toast } from "sonner"
import { useAuthStore } from "../../features/auth/store/authStore"
import { API_ROUTES } from "../constants/api.const"

declare module "axios" {
  export interface AxiosRequestConfig {
    skipToast?: boolean
    successToast?: string
    _retry?: boolean
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
  timeout: 10000,
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> =
  []

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Interceptor 1: Success Toast Handling
api.interceptors.response.use((response) => {
  const successToast = response.config?.successToast
  if (successToast) {
    const message = successToast || response.data?.message || "Action completed successfully"
    toast.success(message)
  }
  return response
})

// Interceptor 2: Silent Token Refresh (Authentication Recovery)
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Handle Session Expiry (Try silent refresh on 401, unless it's refresh token, login, or logout)
    if (status === 401 && !originalRequest._retry) {
      const isAuthExemptRequest =
        originalRequest.url?.includes(API_ROUTES.AUTH.REFRESH_TOKEN) ||
        originalRequest.url?.includes(API_ROUTES.AUTH.LOGIN) ||
        originalRequest.url?.includes(API_ROUTES.AUTH.LOGOUT)

      if (isAuthExemptRequest) {
        // If refresh token, login, or logout request failed, clear credentials silently
        localStorage.removeItem("wq_user")
        localStorage.removeItem("wq_auth")
        localStorage.removeItem("wq_temp_email")

        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
        })

        const msg = error.response?.data?.message
        if (msg && (msg.includes("suspended") || msg.includes("blocked"))) {
          toast.error(msg, { id: "suspension-toast" })
        }

        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      return new Promise((resolve, reject) => {
        api
          .post(API_ROUTES.AUTH.REFRESH_TOKEN, {}, { skipToast: true })
          .then(() => {
            processQueue(null)
            resolve(api(originalRequest))
          })
          .catch((err) => {
            processQueue(err)

            // Force logout on refresh token failure
            localStorage.removeItem("wq_user")
            localStorage.removeItem("wq_auth")
            localStorage.removeItem("wq_temp_email")

            useAuthStore.setState({
              user: null,
              isAuthenticated: false,
            })

            const msg = err.response?.data?.message
            if (msg && (msg.includes("suspended") || msg.includes("blocked"))) {
              toast.error(msg, { id: "suspension-toast" })
            }

            reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    }

    return Promise.reject(error)
  }
)

// Interceptor 3: Error Toast Handling
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const message = error.response?.data?.message || "Server Error"
    const skipToast = error.config?.skipToast
    const url = error.config?.url

    const isExemptFromToast =
      url?.includes(API_ROUTES.AUTH.LOGOUT) ||
      url?.includes(API_ROUTES.AUTH.REFRESH_TOKEN) ||
      url?.includes(API_ROUTES.AUTH.LOGIN)

    // Only display error toast if it wasn't a standard 401 or auth exempt request
    if (status !== 401 && !isExemptFromToast && !skipToast) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)
