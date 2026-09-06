import { passwordRules } from "./passwordRules"

export const isStrongPassword = (password: string) =>
  Object.values(passwordRules).every((rule) => rule(password))
