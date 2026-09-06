import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom"
import { AlertTriangle, Home as HomeIcon, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export default function ErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)

  let errorMessage = "An unexpected client error has occurred."
  let errorStatus = "Error"
  let errorStack = ""

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status} ${error.statusText}`
    errorMessage = error.data || error.statusText || errorMessage
  } else if (error instanceof Error) {
    errorMessage = error.message
    errorStack = error.stack || ""
  } else if (typeof error === "string") {
    errorMessage = error
  } else if (error && typeof error === "object") {
    errorMessage = JSON.stringify(error)
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-destructive/10 filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-destructive/10 filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-3xl p-8 md:p-10 space-y-8 shadow-2xl backdrop-blur-md text-center z-10 animate-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15 text-destructive border border-destructive/30 shadow-lg shadow-destructive/10 animate-pulse">
          <AlertTriangle className="h-10 w-10 stroke-[2.5]" />
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-xs font-bold uppercase tracking-wider text-destructive">
            {errorStatus}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Unexpected Application Error!
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            WashQueue encountered a runtime exception. Our telemetry engine has recorded the trace
            details.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 border border-border text-left">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
            Error Message
          </span>
          <p className="text-xs font-mono text-destructive break-words leading-relaxed">
            {errorMessage}
          </p>
        </div>

        {errorStack && (
          <div className="space-y-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-1.5 mx-auto text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Stack Trace
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Stack Trace
                </>
              )}
            </button>

            {showDetails && (
              <div className="p-4 rounded-2xl bg-muted/60 border border-border text-left max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Stack Trace
                </span>
                <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-all leading-normal select-text">
                  {errorStack}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 text-sm cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <HomeIcon className="h-4 w-4" />
            Go back Home
          </button>
          <button
            onClick={handleReload}
            className="flex-1 bg-card border border-border hover:bg-muted text-foreground font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 text-sm cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}
