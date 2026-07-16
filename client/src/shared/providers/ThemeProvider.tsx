import { ThemeProvider as NextThemeProvider } from "next-themes"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

const ThemeProvider = ({ children }: Props) => {
  return (
    <NextThemeProvider
      attribute={"class"}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  )
}

export default ThemeProvider
