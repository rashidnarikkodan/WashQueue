import { useActionState, useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useGoogleLogin } from "@react-oauth/google"

import FormInput from "./FormInput"
import SocialButton from "./SocialButton"
import Submit from "./Submit"
import { loginAction } from "../../actions/login.action"
import { useAuthStore } from "../../store/authStore"

const initialState = {
  success: false,
}

export default function LoginForm() {
  const navigate = useNavigate()
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const { loginWithGoogle } = useAuthStore()

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const success = await loginWithGoogle(tokenResponse.access_token)
      if (success) {
        navigate("/")
      }
    },
    onError: () => {
      toast.error("Google login failed")
    }
  })

  const [state, formAction] = useActionState(
    loginAction,
    initialState
  )

  // Sync server action validation errors to local state
  useEffect(() => {
    if (state.errors) {
      setLocalErrors({
        email: state.errors.email?.[0] || "",
        password: state.errors.password?.[0] || ""
      });
    }
  }, [state.errors]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)

      const email = (state as any).email || ""

      if (email.startsWith("admin")) {
        navigate("/admin")
      } else if (email.startsWith("manager")) {
        navigate("/manager")
      } else if (email.startsWith("provider")) {
        navigate("/provider")
      } else {
        navigate("/")
      }
    }

    if (!state.success && state.message) {
      toast.error(state.message)
    }
  }, [state, navigate])

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
          Login
        </h1>

        <p className="text-sm text-muted-foreground font-medium">
          Start managing your vehicle wash bookings
        </p>
      </div>

      <SocialButton
        label="Sign in with Google"
        onClick={() => handleGoogleLogin()}
      />

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1 h-[1px] bg-border/80"></div>

        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          or email
        </span>

        <div className="flex-1 h-[1px] bg-border/80"></div>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <FormInput
          id="email-input"
          label="Email Address"
          type="email"
          name="email"
          placeholder="e.g. rashid@example.com"
          error={localErrors.email}
          onChange={(e) => {
            const val = e.target.value;
            // Instantly clear email format error as soon as they type a valid email format
            if (/\S+@\S+\.\S+/.test(val) || val.trim() === "") {
              setLocalErrors(prev => ({ ...prev, email: "" }));
            }
          }}
          autoComplete="username"
          required
        />

        <FormInput
          id="password-input"
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          error={localErrors.password}
          onChange={(e) => {
            const val = e.target.value;
            // Instantly clear password error as soon as it meets the min length condition
            if (val.length >= 6 || val.trim() === "") {
              setLocalErrors(prev => ({ ...prev, password: "" }));
            }
          }}
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between pt-1">
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-primary hover:text-primary/90 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Submit />
      </form>
    </div>
  )
}