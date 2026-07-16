export interface ErrorResponseLike {
  response?: {
    data?: {
      message?: string
    }
    status?: number
  }
  message?: string
  config?: {
    _retry?: boolean
    url?: string
    skipToast?: boolean
  }
}

export const getErrorMessage = (error: unknown, fallback = "Server Error"): string => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as Partial<ErrorResponseLike>

    // 1. Check server response custom message first
    if (
      typeof maybeError.response?.data?.message === "string" &&
      maybeError.response.data.message.trim()
    ) {
      return maybeError.response.data.message
    }

    // 2. Check standard Error.message
    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as Partial<ErrorResponseLike>
    if (typeof maybeError.response?.status === "number") {
      return maybeError.response.status
    }
  }

  return undefined
}

export const getErrorConfig = (error: unknown): ErrorResponseLike["config"] => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as Partial<ErrorResponseLike>
    return maybeError.config
  }

  return undefined
}
