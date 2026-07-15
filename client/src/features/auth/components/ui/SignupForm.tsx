import { useActionState, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useGoogleLogin } from "@react-oauth/google"
import { AlertCircle } from "lucide-react"

import FormInput from "../../../../shared/components/form/FormInput"
import SocialButton from "./SocialButton"
import Submit from "./Submit"
import { signupAction, type SignupState } from "../../actions/signup.action"
import { useAuthStore } from "../../store/authStore"
import { ROLE, VIEW_MODE } from "../../../../shared/constants/role.const"

const initialState: SignupState = {
  success: false,
}

export default function SignupForm() {
  const navigate = useNavigate()
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const [password, setPassword] = useState("")
  const { loginWithGoogle } = useAuthStore()

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const success = await loginWithGoogle(tokenResponse.access_token)
      if (success) {
        const user = useAuthStore.getState().user
        console.log("Google signup response user:", user)
        if (user?.isNewUser) {
          navigate("/setup-account")
        } else {
          const role = user?.role
          if (role === ROLE.ADMIN) {
            navigate("/admin")
          } else if (role === ROLE.MANAGER) {
            navigate("/manager")
          } else if (role === ROLE.OWNER) {
            const activeViewMode = useAuthStore.getState().activeViewMode
            navigate(activeViewMode === VIEW_MODE.CUSTOMER ? "/" : "/owner")
          } else {
            navigate("/")
          }
        }
      }
    },
    onError: () => {
      toast.error("Google sign-up failed")
    }
  })

  const [state, formAction] = useActionState(
    signupAction,
    initialState
  )

  // Sync validation errors to local state
  useEffect(() => {
    setLocalErrors({
      name: state.errors?.name?.[0] || "",
      email: state.errors?.email?.[0] || "",
      password: state.errors?.password?.[0] || "",
      confirmPassword: state.errors?.confirmPassword?.[0] || "",
    })
  }, [state.errors])

  useEffect(() => {
    if (state.success && state.email && state.name) {
      // Sync verification context to Zustand store and localStorage
      useAuthStore.setState({
        tempUser: { name: state.name, email: state.email }
      })
      localStorage.setItem("wq_temp_email", state.email)

      toast.success(state.message || "Registration successful!")
      navigate("/verify-email")
    }

    // Error is handled via inline message box inside form
  }, [state, navigate])

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Start managing your vehicle wash bookings
        </p>
      </div>

      <SocialButton label="Sign up with Google" onClick={() => handleGoogleLogin()} />

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1 h-[1px] bg-border/80"></div>
        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">or email</span>
        <div className="flex-1 h-[1px] bg-border/80"></div>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        {(!state.success && state.message) && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        <FormInput
          id="name-signup-input"
          label="Full Name"
          type="text"
          name="name"
          placeholder="Rashid Narikkodan"
          defaultValue={state.name || ""}
          error={localErrors.name}
          onChange={() => {
            if (localErrors.name) {
              setLocalErrors((prev) => ({ ...prev, name: "" }))
            }
          }}
          autoComplete="name"
          required
        />

        <FormInput
          id="email-signup-input"
          label="Email Address"
          type="email"
          name="email"
          placeholder="rashid@example.com"
          defaultValue={state.email || ""}
          error={localErrors.email}
          onChange={(e) => {
            const val = e.target.value
            // Instantly clear email format error as soon as they type a valid email format
            if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) || val.trim() === "") {
              setLocalErrors((prev) => ({ ...prev, email: "" }))
            }
          }}
          autoComplete="username"
          required
        />

        <FormInput
          id="password-signup-input"
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          error={localErrors.password}
          onChange={(e) => {
            const val = e.target.value
            setPassword(val)
            const hasMinLength = val.length >= 8
            const hasCapital = /[A-Z]/.test(val)
            const hasNumber = /\d/.test(val)
            const hasSpecial = /[@$!%*?&#]/.test(val)

            if ((hasMinLength && hasCapital && hasNumber && hasSpecial) || val.trim() === "") {
              setLocalErrors((prev) => ({ ...prev, password: "" }))
            }
          }}
          autoComplete="new-password"
          required
        />

        {password.length > 0 && (
          <div className="text-[11px] space-y-1.5 p-3.5 bg-background/30 rounded-2xl border border-border/40 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
            <p className="font-bold text-muted-foreground mb-1">Password Requirements:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${password.length >= 8 ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span className={`transition-colors duration-300 ${password.length >= 8 ? "text-emerald-400 font-semibold" : "text-muted-foreground"}`}>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${/[A-Z]/.test(password) ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span className={`transition-colors duration-300 ${/[A-Z]/.test(password) ? "text-emerald-400 font-semibold" : "text-muted-foreground"}`}>One capital letter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${/\d/.test(password) ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span className={`transition-colors duration-300 ${/\d/.test(password) ? "text-emerald-400 font-semibold" : "text-muted-foreground"}`}>One number</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${/[@$!%*?&#]/.test(password) ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span className={`transition-colors duration-300 ${/[@$!%*?&#]/.test(password) ? "text-emerald-400 font-semibold" : "text-muted-foreground"}`}>One special char (@, $, !, %, etc.)</span>
              </div>
            </div>
          </div>
        )}

        <FormInput
          id="confirm-password-signup-input"
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          error={localErrors.confirmPassword}
          onChange={() => {
            if (localErrors.confirmPassword) {
              setLocalErrors((prev) => ({ ...prev, confirmPassword: "" }))
            }
          }}
          autoComplete="new-password"
          required
        />

        <Submit text="Signup" pendingText="Signing Up..." />
      </form>
    </div>
  )
}
