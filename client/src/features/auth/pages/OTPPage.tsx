import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, ArrowLeft } from "lucide-react"
import Loading from "../../../shared/components/ui/Loading"
import { useAuthStore } from "../store/auth.store"
import { useAuthFormStore } from "../store/auth-form.store"
import { toast } from "sonner"
import OtpInput from "../../../shared/components/form/OtpInput"
import { useCountdownTimer } from "../../../shared/hooks/useCountdownTimer"

export default function OTPPage() {
  const navigate = useNavigate()
  const { verifyOTP, resendOTP, user } = useAuthStore()
  const { otpDigits, setOtpDigits, resetForm } = useAuthFormStore()

  const tempUser = useAuthStore((state) => state.tempUser)
  const email = tempUser?.email || localStorage.getItem("wq_temp_email") || user?.email

  const isVerifyingRef = useRef(false)
  const lastVerifiedCodeRef = useRef("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const { isResendActive, resetTimer, formatTimer } = useCountdownTimer(25)

  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    return () => {
      resetForm()
    }
  }, [resetForm])

  useEffect(() => {
    const code = otpDigits.join("")
    if (code.length < 6) {
      lastVerifiedCodeRef.current = ""
    }
    if (
      code.length === 6 &&
      code !== lastVerifiedCodeRef.current &&
      !isVerified &&
      !isVerifyingRef.current
    ) {
      lastVerifiedCodeRef.current = code
      isVerifyingRef.current = true
      setIsVerifying(true)
      const triggerVerify = async () => {
        try {
          const success = await verifyOTP(code)
          if (success) {
            setIsVerified(true)
            navigate("/setup-account")
          }
        } finally {
          isVerifyingRef.current = false
          setIsVerifying(false)
        }
      }
      triggerVerify()
    }
  }, [otpDigits, verifyOTP, isVerified, navigate])

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address not found.")
      return
    }
    setIsResending(true)
    try {
      const success = await resendOTP(email)
      if (success) {
        resetTimer(25)
      }
    } finally {
      setIsResending(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otpDigits.join("")
    if (code.length === 6 && !isVerified && !isVerifyingRef.current) {
      isVerifyingRef.current = true
      setIsVerifying(true)
      try {
        const success = await verifyOTP(code)
        if (success) {
          setIsVerified(true)
          navigate("/setup-account")
        }
      } finally {
        isVerifyingRef.current = false
        setIsVerifying(false)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8 relative overflow-hidden w-full transition-colors duration-300">
      <main className="grow flex items-center justify-center z-10 p-4">
        {!isVerified ? (
          <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-4 self-start w-fit group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Sign Up
            </Link>
            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none bg-linear-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
                Confirm Email
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                Enter the 6-digit verification code sent to{" "}
                <strong className="text-foreground">{email || "your registered email"}</strong>.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-8">
              <div className="flex justify-center">
                <OtpInput value={otpDigits} onChange={setOtpDigits} disabled={isVerifying} />
              </div>

              <div className="space-y-4 max-w-sm mx-auto">
                <button
                  type="submit"
                  disabled={otpDigits.join("").length < 6 || isVerifying}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loading size="sm" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>

                <div className="text-center space-y-1">
                  {!isResendActive ? (
                    <span className="text-xs text-muted-foreground block">
                      Resend available in {formatTimer}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-xs font-bold text-primary hover:text-primary/90 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 justify-center mx-auto"
                    >
                      {isResending && <Loading size="sm" />}
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-md bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl p-8 space-y-6 text-center shadow-2xl animate-in zoom-in duration-300 z-20">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shadow-inner relative">
                <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-75"></span>
                <Check className="h-8 w-8 stroke-3 relative z-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Email Verified
              </h2>
              <p className="text-sm text-muted-foreground">
                Your account setup is ready for role assignment.
              </p>
            </div>

            <button
              onClick={() => navigate("/setup-account")}
              className="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-foreground font-bold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer text-sm"
            >
              Continue to Role Setup
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
