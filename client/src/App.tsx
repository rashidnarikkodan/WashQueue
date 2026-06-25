import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import ThemeProvider from "./shared/providers/ThemeProvider";
import { AuthProvider } from "./features/auth/store/AuthContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;
