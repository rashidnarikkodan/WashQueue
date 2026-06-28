import axios from "axios"
import { useAuthStore } from "../../features/auth/store/authStore"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
    timeout: 10000,
})

// Response interceptor to catch 401 errors and clean up local auth state
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("wq_user")
            localStorage.removeItem("wq_auth")
            localStorage.removeItem("wq_temp_email")

            // Reset Zustand store
            useAuthStore.setState({
                user: null,
                isAuthenticated: false,
            })
        }
        return Promise.reject(error)
    }
)