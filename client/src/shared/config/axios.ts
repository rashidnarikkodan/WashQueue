import axios from "axios"
import { toast } from "sonner"
import { useAuthStore } from "../../features/auth/store/authStore"

declare module "axios" {
  export interface AxiosRequestConfig {
    skipToast?: boolean;
    successToast?: string;
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

// Response interceptor to handle global toasts and auth state cleanup
api.interceptors.response.use(
    (response) => {
        const successToast = response.config?.successToast;
        if (successToast) {
            const message = successToast || response.data?.message || "Action completed successfully";
            toast.success(message);
        }
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Something went wrong";
        const skipToast = error.config?.skipToast;

        // Handle Session Expiry (No Toast)
        if (status === 401) {
            localStorage.removeItem("wq_user")
            localStorage.removeItem("wq_auth")
            localStorage.removeItem("wq_temp_email")

            // Reset Zustand store
            useAuthStore.setState({
                user: null,
                isAuthenticated: false,
            })
            return Promise.reject(error)
        }

        // Critical errors that should always toast (no status, 5xx server crash)
        const isCriticalError = 
            !status || 
            status >= 500;

        if (isCriticalError || !skipToast) {
            toast.error(message);
        }

        return Promise.reject(error)
    }
)