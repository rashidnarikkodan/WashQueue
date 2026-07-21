import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, KeyRound } from "lucide-react"
import Loading from "../../../shared/components/ui/Loading"
import { useAuthStore } from "../store/authStore"
import { authApi } from "../../../shared/apis/auth.api"
import { getErrorMessage } from "../../../shared/utils/error"
import FormInput from "../../../shared/components/form/FormInput"
import { toast } from "sonner"
import PasswordStrength from "@/shared/components/ui/PasswordStrength"
import { isStrongPassword } from "@/shared/utils/validation"
import OtpInput from "../../../shared/components/ui/OtpInput"
import { useCountdownTimer } from "../../../shared/hooks/useCountdownTimer"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword } = useAuthStore()
  const [isResetting, setIsResetting] = useState(false)

  const [email, setEmail] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""))
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Resend OTP states & timer hook
  const { isResendActive, resetTimer, formatTimer } = useCountdownTimer(60)
  const [isResending, setIsResending] = useState(false)

  // Get email from localStorage where it was saved during forgot password request
  useEffect(() => {
    const savedEmail = localStorage.getItem("wq_reset_email")
    if (!savedEmail) {
      toast.error("Password reset session not found. Please request a new code.")
      navigate("/forgot-password")
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(savedEmail)
  }, [navigate])

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address not found.")
      return
    }
    setIsResending(true)
    try {
      await authApi.forgotPassword(email)
      resetTimer(60)
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to resend verification code."))
    } finally {
      setIsResending(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    const code = otpDigits.join("")
    if (code.length < 6) {
      newErrors.code = "Please enter the complete 6-digit verification code"
      isValid = false
    }

    if (!password) {
      newErrors.password = "New password is required"
      isValid = false
    } else if (!isStrongPassword(password)) {
      newErrors.password = "Password does not meet the security requirements"
      isValid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const code = otpDigits.join("")
    setIsResetting(true)
    try {
      const success = await resetPassword(email, code, password)
      if (success) {
        navigate("/login")
        toast.success("Password reset successfully!")
      }
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8 relative overflow-hidden w-full transition-colors duration-300">
      {/* Background Decor Glow */}
      <div className="absolute left-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-primary/5 filter blur-3xl"></div>

      <main className="flex-grow flex items-center justify-center z-10 p-4">
        <div className="w-full max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
          {/* Back button properly aligned and styled simply */}
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors w-fit group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          {/* Header Section (Directly on Page - No divider line) */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-foreground via-foreground/90 to-primary/80 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Enter the 6-digit verification code sent to{" "}
              <strong className="text-foreground">{email}</strong> and set your new password.
            </p>
          </div>

          {/* Split layout Form (Directly on Page - Wide layout, no vertical or horizontal dividing lines) */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 pt-2"
            noValidate
          >
            {/* Left Column: OTP Verification */}
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">Verification Code</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Please enter the code sent to your email to verify your request.
                  </p>
                </div>

                <OtpInput value={otpDigits} onChange={setOtpDigits} disabled={isResetting} />

                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
              </div>

              {/* Resend OTP minimal inline section */}
              <div className="text-left mt-4 min-h-[24px]">
                {!isResendActive ? (
                  <p className="text-xs text-muted-foreground">
                    Didn't receive the code? Resend in{" "}
                    <strong className="text-foreground">{formatTimer}</strong>
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Didn't receive the code?</p>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                    >
                      {isResending && <Loading size="sm" />}
                      Resend Code
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Reset Password (No divider line/borders) */}
            <div className="space-y-8 md:pl-8 lg:pl-12">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Set New Password</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choose a strong, secure password that you don't use elsewhere.
                </p>
              </div>

              <div className="space-y-5">
                <FormInput
                  id="new-password"
                  label="New Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      setErrors((prev) => {
                        const copy = { ...prev }
                        delete copy.password
                        return copy
                      })
                    }
                  }}
                  error={errors.password}
                  required
                />
                <PasswordStrength password={password} />

                <FormInput
                  id="confirm-password"
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) {
                      setErrors((prev) => {
                        const copy = { ...prev }
                        delete copy.confirmPassword
                        return copy
                      })
                    }
                  }}
                  error={errors.confirmPassword}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isResetting}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <Loading size="sm" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
