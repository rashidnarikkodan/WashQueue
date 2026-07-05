export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const response = <T>(data: T, message: string): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
  }
}

export default response
