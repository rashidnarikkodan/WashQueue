import { loginSchema } from "../schemas/login.schema"
type LoginState = {
  success?: boolean
  message?: string
  email?: string
  errors?: {
    email?: string[]
    password?: string[]
  }
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const validated = loginSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    // fake request
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const { email, password } = validated.data

    // fake auth
    if (password !== "password123") {
      return {
        success: false,
        message: "Invalid credentials",
      }
    }

    return {
      success: true,
      message: "Login successful",
      email,
    }
  } catch {
    return {
      success: false,
      message: "Something went wrong",
    }
  }
}