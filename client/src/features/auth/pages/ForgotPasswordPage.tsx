import { useNavigate } from "react-router-dom"
import FormInput from "../../../shared/components/form/FormInput"
import Loading from "../../../shared/components/ui/Loading"
import { useAuthFormStore } from "../store/authFormStore"
import { useAuthStore } from "../store/authStore"
import { toast } from "sonner"
import { useState, useEffect } from "react"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { forgotPassword } = useAuthStore()
  const { forgotEmail, errors, setField, validateForgotPassword, resetForm, clearError } =
    useAuthFormStore()

  // Reset form inputs and errors when component unmounts
  useEffect(() => {
    return () => {
      resetForm()
    }
  }, [resetForm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForgotPassword()) return

    setIsLoading(true)
    const success = await forgotPassword(forgotEmail)
    setIsLoading(false)

    if (success) {
      toast.success("Verification OTP code sent successfully!")
      navigate("/reset-password")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8 relative overflow-hidden w-full">
      {/* Background Decor Glow */}
      <div className="absolute left-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-primary/5 filter blur-3xl"></div>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center z-10 p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Title Section */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Please enter your registered email address
            </p>
          </div>

          {/* Form Input Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="forgot-email"
              label="Email Address"
              type="email"
              placeholder="e.g. rashid@example.com"
              value={forgotEmail}
              onChange={(e) => {
                setField("forgotEmail", e.target.value)
                clearError("forgotEmail")
              }}
              error={errors.forgotEmail}
              autoComplete="username"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
