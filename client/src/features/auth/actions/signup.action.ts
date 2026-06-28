import { api } from "../../../shared/config/axios"

export interface SignupState {
  success: boolean
  message?: string
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
  email?: string
  name?: string
}

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  try {
    const name = formData.get("name")?.toString().trim() || ""
    const email = formData.get("email")?.toString().trim() || ""
    const password = formData.get("password")?.toString() || ""
    const confirmPassword = formData.get("confirmPassword")?.toString() || ""

    const errors: SignupState["errors"] = {}

    // validation
    if (!name) {
      errors.name = ["Name is required"]
    }

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

    if (!confirmPassword) {
      errors.confirmPassword = ["Confirm password is required"]
    } else if (confirmPassword !== password) {
      errors.confirmPassword = ["Passwords do not match"]
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      }
    }

    // API call
    const response = await api.post("/auth/signup", {
      name,
      email,
      password,
    })

    return {
      success: true,
      message: response.data.message || "Registration successful! Please verify your email.",
      email,
      name,
    }
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Registration failed. Please try again.",
    }
  }
}
