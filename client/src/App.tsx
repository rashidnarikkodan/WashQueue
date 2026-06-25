import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import ThemeProvider from "./shared/providers/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App;
