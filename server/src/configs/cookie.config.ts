import { CookieOptions } from "express"
import env from "./env.config"

const isProduction = env.NODE_ENV === "production"

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: env.ACCESS_TOKEN_EXPIRES_IN * 1000,
}

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: env.REFRESH_TOKEN_EXPIRES_IN * 1000,
}
