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
      className="m-auto w-full max-w-md rounded-3xl border border-border/80 bg-card p-0 shadow-2xl backdrop:bg-background/80 backdrop:backdrop-blur-md overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col p-6 sm:p-7 space-y-6 text-left relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0">
            <ShieldAlert size={24} className="stroke-[2.2]" />
          </div>

          <div className="space-y-1.5 pr-6">
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">
              {title || "Sign in Required"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              {message ||
                `You must be logged in to ${actionName}. Please sign in to your WashQueue account or register to continue.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <LogIn size={16} />
            <span>Sign In to Account</span>
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            className="w-full py-3 px-4 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <UserPlus size={16} className="text-primary" />
            <span>Create New Account</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-1"
          >
            Cancel & Continue Browsing
          </button>
        </div>
      </div>
    </dialog>
  )
}
