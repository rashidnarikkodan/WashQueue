import { authApi } from "../services/auth.api"
import { getErrorMessage } from "../../../shared/utils/error"
import type { SignupState } from "../types"

export type { SignupState } from "../types"

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  let name = ""
  let email = ""
  try {
    name = formData.get("name")?.toString().trim() || ""
    email = formData.get("email")?.toString().trim() || ""
    const password = formData.get("password")?.toString() || ""
    const confirmPassword = formData.get("confirmPassword")?.toString() || ""

    const errors: SignupState["errors"] = {}

    // validation
    if (!name) {
      errors.name = ["Name is required"]
    }

    if (!email) {
      errors.email = ["Email is required"]
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = ["Please enter a valid email address"]
    }

    if (!password) {
      errors.password = ["Password is required"]
    } else {
      const passwordErrors: string[] = []
      if (password.length < 8) {
        passwordErrors.push("8 characters")
      }
      if (!/[A-Z]/.test(password)) {
        passwordErrors.push("one uppercase letter")
      }
      if (!/\d/.test(password)) {
        passwordErrors.push("one number")
      }
      if (!/[@$!%*?&#]/.test(password)) {
        passwordErrors.push("one special character (@, $, !, %, etc.)")
      }

      if (passwordErrors.length > 0) {
        errors.password = [`Password is missing: ${passwordErrors.join(", ")}`]
      }
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
        email,
        name,
      }
    }

    // API call
    await authApi.signup(name, email, password)

    return {
      success: true,
      message: "Registration successful! Please verify your email.",
      email,
      name,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Registration failed. Please try again."),
      email,
      name,
    }
  }
}
