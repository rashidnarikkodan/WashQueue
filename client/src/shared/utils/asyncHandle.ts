import { handleApiError } from "./handleApiError"

export function asyncHandle<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  fallbackMessage = "Request failed"
) {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args)
    } catch (error) {
      handleApiError(error, fallbackMessage)
    }
  }
}
