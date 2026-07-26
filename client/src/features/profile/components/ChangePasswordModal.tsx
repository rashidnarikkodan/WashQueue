import { useEffect, useRef, useState } from "react"
import { X, KeyRound, Loader2 } from "lucide-react"
import FormInput from "@/shared/components/form/FormInput"
import { toast } from "sonner"

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
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Password updated successfully!")
      onClose()
    }, 800)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto bg-[#0F172A] border border-slate-700/80 shadow-2xl rounded-3xl p-0 w-full max-w-md overflow-hidden backdrop:bg-slate-900/70 backdrop:backdrop-blur-md text-[#F8FAFC]"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#ADC6FF]/10 text-[#ADC6FF]">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">Change Password</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

        <FormInput
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-xl hover:bg-slate-800 text-slate-300 font-bold text-xs tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-[#ADC6FF] hover:bg-[#c2d7ff] text-[#002E6A] font-bold text-xs tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </dialog>
  )
}
