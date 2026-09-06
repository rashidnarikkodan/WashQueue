import { getErrorMessage } from "./error"

export function handleApiError(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error, fallback), {
    cause: error,
  })
}
