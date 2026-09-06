import axios from "axios"
import { toast } from "sonner"
import { useAuthStore } from "../../features/auth/store/auth.store"
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
  timeout: 30000,
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

api.interceptors.response.use((response) => {
  const successToast = response.config?.successToast
  if (successToast) {
    const message = successToast || response.data?.message || "Action completed successfully"
    toast.success(message)
  }
  return response
})

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

    if (status === 401 && !originalRequest._retry) {
      const isAuthExemptRequest =
        originalRequest.url?.includes(API_ROUTES.AUTH.REFRESH_TOKEN) ||
        originalRequest.url?.includes(API_ROUTES.AUTH.LOGIN) ||
        originalRequest.url?.includes(API_ROUTES.AUTH.LOGOUT)

      if (isAuthExemptRequest) {
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
            originalRequest._retry = true
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

    if (status !== 401 && !isExemptFromToast && !skipToast) {
      toast.error(message, { duration: 4500 })
    }

    return Promise.reject(error)
  }
)
