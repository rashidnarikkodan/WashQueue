import { useEffect, useRef, useState } from "react"
import { X, KeyRound, Loader2 } from "lucide-react"
import FormInput from "@/shared/components/form/FormInput"
import { toast } from "sonner"

import { authApi } from "@/shared/apis/auth.api"
import { getErrorMessage } from "@/shared/utils/error"
import { useAuthStore } from "@/features/auth/store/auth.store"
import PasswordStrength from "@/shared/components/ui/PasswordStrength"
import { passwordRules } from "@/shared/utils/passwordRules"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const reset = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrors({})
    setIsSubmitting(false)
  }

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
        reset()
      }
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (!passwordRules.minLength(newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters"
    } else if (!passwordRules.uppercase(newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter"
    } else if (!passwordRules.lowercase(newPassword)) {
      newErrors.newPassword = "Password must contain at least one lowercase letter"
    } else if (!passwordRules.number(newPassword)) {
      newErrors.newPassword = "Password must contain at least one number"
    } else if (!passwordRules.special(newPassword)) {
      newErrors.newPassword = "Password must contain at least one special character (@$!%*?&#)"
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "New password cannot be the same as current password"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      await authApi.changePassword(currentPassword, newPassword)
      toast.success("Password changed successfully!")
      onClose()
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to change password")
      toast.error(msg)
      setErrors({ submit: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  const user = useAuthStore((state) => state.user)
  const isGoogleAccount = user?.authProvider === "google"

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto bg-card border border-border shadow-xl rounded-3xl p-0 w-full max-w-md overflow-hidden backdrop:bg-background/80 backdrop:backdrop-blur-md text-foreground"
    >
      <div className="flex justify-between items-center px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {isGoogleAccount ? "Account Security" : "Change Password"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isGoogleAccount ? (
        <div className="p-6 space-y-5 text-left">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm space-y-2">
            <h4 className="font-bold text-foreground">Google Managed Account</h4>
            <p className="leading-relaxed text-muted-foreground">
              Your account is authenticated via Google OAuth 2.0 Single Sign-On. Passwords and security credentials are managed directly through your Google Account.
            </p>
          </div>
          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <FormInput
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
            required
          />

          <FormInput
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            required
          />

          <PasswordStrength password={newPassword} />

          <FormInput
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-xs tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}
