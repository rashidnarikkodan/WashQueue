import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"


export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
})

// Request interceptor to inject jwt token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("wq_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)