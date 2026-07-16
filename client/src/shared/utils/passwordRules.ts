export const passwordRules = {
  minLength: (v: string) => v.length >= 8,
  lowercase: (v: string) => /[a-z]/.test(v),
  uppercase: (v: string) => /[A-Z]/.test(v),
  number: (v: string) => /\d/.test(v),
  special: (v: string) => /[@$!%*?&#]/.test(v),
};