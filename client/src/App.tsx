import { RouterProvider } from "react-router-dom"
import { router } from "./app/routes"
import ThemeProvider from "./shared/providers/ThemeProvider"
import { Toaster } from "sonner"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { useAuthStore } from "./features/auth/store/auth.store"
import { useEffect } from "react"
import { authApi } from "./shared/apis/auth.api"
import { TOASTER } from "./shared/constants/toaster.const"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {
  useEffect(() => {
    authApi
      .me()
      .then((user) => {
        useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
      })
      .catch(() => {
        useAuthStore.setState({ isLoading: false })
      })
  }, [])

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster
          position={TOASTER.POSITION}
          theme={TOASTER.THEME}
          duration={TOASTER.DURATION}
          closeButton
          toastOptions={{
            classNames: TOASTER.CLASS_NAMES,
          }}
        />{" "}
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}

export default App
