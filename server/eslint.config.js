import eslint from "@eslint/js"

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },

  eslint.configs.recommended,

  {
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
]