import { authApi } from "../services/auth.api"

export interface LoginState {
  success: boolean
  message?: string
  errors?: {
    email?: string[]
    password?: string[]
  }
  user?: any
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    const email = formData.get("email")?.toString().trim() || ""
    const password = formData.get("password")?.toString() || ""

    const errors: LoginState["errors"] = {}

    // validation
    if (!email) {
      errors.email = ["Email is required"]
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = ["Please enter a valid email address"]
    }

    if (!password) {
      errors.password = ["Password is required"]
    } else if (password.length < 8) {
      errors.password = ["Password must be at least 8 characters"]
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      }
    }

    // API call
    const user = await authApi.login(email, password)

    return {
      success: true,
      message: "Login successful",
      user,
    }
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to login",
    }
  }
}