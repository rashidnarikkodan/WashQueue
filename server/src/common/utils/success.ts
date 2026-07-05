import { Response } from "express"

export interface ApiSuccessResponse<T> {
  success: boolean
  message: string
  data: T
}

export const success = <T>(
  res: Response,
  data: T,
  statusCode: number,
  message: string
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export default success
