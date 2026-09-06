import { useActionState, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useGoogleLogin } from "@react-oauth/google"
import { AlertCircle } from "lucide-react"

import FormInput from "../../../../shared/components/form/FormInput"
import SocialButton from "./SocialButton"
import Submit from "./Submit"
import { signupAction, type SignupState } from "../../actions/signup.action"
import { useAuthStore } from "../../store/auth.store"
import { ROLE, VIEW_MODE } from "../../../../shared/constants/role.const"
import PasswordStrength from "@/shared/components/ui/PasswordStrength"

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
    },
  })

  const [state, formAction] = useActionState(signupAction, initialState)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalErrors({
      name: state.errors?.name?.[0] || "",
      email: state.errors?.email?.[0] || "",
      password: state.errors?.password?.[0] || "",
      confirmPassword: state.errors?.confirmPassword?.[0] || "",
    })
  }, [state.errors])

  useEffect(() => {
    if (state.success && state.email && state.name) {
      useAuthStore.setState({
        tempUser: { name: state.name, email: state.email },
      })
      localStorage.setItem("wq_temp_email", state.email)

      toast.success(state.message || "Registration successful!")
      navigate("/verify-email")
    }
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
        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          or email
        </span>
        <div className="flex-1 h-[1px] bg-border/80"></div>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        {!state.success && state.message && (
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
        <PasswordStrength password={password} />

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
