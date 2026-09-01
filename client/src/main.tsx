import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import "./shared/styles/globals.css"
import App from "./App.tsx"


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
