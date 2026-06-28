import { CookieOptions } from "express"
import env from "./env.config"

const isProduction = env.NODE_ENV === "production"

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15 min
}

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}