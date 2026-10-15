import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, LogIn, UserPlus, X } from "lucide-react"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"

export interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  actionName?: string
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title,
  message,
  actionName = "proceed",
}: AuthRequiredModalProps) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
        document.body.style.overflow = "hidden"
      }
    } else {
      if (dialog.open) {
        dialog.close()
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  if (!isOpen) return null

  const handleSignIn = () => {
    onClose()
    navigate(APP_ROUTES.AUTH.LOGIN)
  }

  const handleSignUp = () => {
    onClose()
    navigate(APP_ROUTES.AUTH.SIGNUP)
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="m-auto w-[calc(100%-1.5rem)] sm:w-full max-w-md rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-0 shadow-lg sm:shadow-2xl backdrop:bg-background/80 backdrop:backdrop-blur-sm sm:backdrop:backdrop-blur-md overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col p-4 sm:p-7 space-y-4 sm:space-y-6 text-left relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs sm:shadow-sm shrink-0">
            <ShieldAlert size={20} className="stroke-[2.2] sm:w-6 sm:h-6" />
          </div>

          <div className="space-y-1 sm:space-y-1.5 pr-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              {title || "Sign in Required"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              {message ||
                `You must be logged in to ${actionName}. Please sign in to your WashQueue account or register to continue.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-2.5 pt-1 sm:pt-2">
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs sm:shadow-md cursor-pointer"
          >
            <LogIn size={15} />
            <span>Sign In to Account</span>
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            className="w-full py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <UserPlus size={15} className="text-primary" />
            <span>Create New Account</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5"
          >
            Cancel & Continue Browsing
          </button>
        </div>
      </div>
    </dialog>
  )
}
