import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import ThemeProvider from "./shared/providers/ThemeProvider";
import { Toaster } from "sonner";

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}

export default App;
