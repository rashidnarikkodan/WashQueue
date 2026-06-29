import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import ThemeProvider from "./shared/providers/ThemeProvider";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "./features/auth/store/authStore";
import { useEffect } from "react";
import { authApi } from "./features/auth/services/auth.api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {

  useAuthStore.subscribe((state) => {
  console.log("Auth State Changed:", state)
})

  useEffect(() => {
    authApi.me()
      .then((user) => {
        useAuthStore.setState({ user, isAuthenticated: true });
      })
      .catch(() => {
        // Handled globally by response interceptor
      });
  }, []);

  return (    
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
    </GoogleOAuthProvider>
    
  )
}

export default App;
