import { accessTokenCookieOptions, refreshTokenCookieOptions } from "@/configs/cookie.config"
import { Response } from "express"

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, accessTokenCookieOptions)

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", accessTokenCookieOptions)

  res.clearCookie("refreshToken", refreshTokenCookieOptions)
}
