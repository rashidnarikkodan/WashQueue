import { useActionState, useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useGoogleLogin } from "@react-oauth/google"
import { AlertCircle } from "lucide-react"

import FormInput from "../../../../shared/components/form/FormInput"
import SocialButton from "./SocialButton"
import Submit from "./Submit"
import { loginAction, type LoginState } from "../../actions/login.action"
import { useAuthStore } from "../../store/authStore"
import { ROLE, VIEW_MODE } from "../../../../shared/constants/role.const"

const initialState: LoginState = {
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
        const user = useAuthStore.getState().user
        console.log("Google login response user:", user)
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
      toast.error("Google login failed")
    }
  })

  const [state, formAction] = useActionState(
    loginAction,
    initialState
  )

  // Sync validation errors to local state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalErrors({
      email: state.errors?.email?.[0] || "",
      password: state.errors?.password?.[0] || ""
    });
  }, [state.errors]);

  useEffect(() => {
    if (state.success && state.user) {
      // Sync auth state to Zustand store and localStorage for persistence
      useAuthStore.setState({
        user: state.user,
        isAuthenticated: true,
      })
      localStorage.setItem("wq_user", JSON.stringify(state.user))
      localStorage.setItem("wq_auth", "true")

      toast.success(state.message || "Login successful")

      const role = state.user.role
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
    } else if (state.message === "Account is not verified") {
      if (state.email) {
        localStorage.setItem("wq_temp_email", state.email);
      }
      toast.warning("Your account is not verified. Redirecting to verification...");
      navigate("/verify-email");
    }

    // Error is handled via inline message box inside form
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
        {(!state.success && state.message) && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        <FormInput
          id="email-input"
          label="Email Address"
          type="email"
          name="email"
          placeholder="e.g. rashid@example.com"
          defaultValue={state.email || ""}
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
            // Instantly clear password error as soon as it meets the min length condition (8 chars)
            if (val.length >= 8 || val.trim() === "") {
              setLocalErrors(prev => ({ ...prev, password: "" }));
            }
          }}
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-end pt-1">
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-primary hover:text-primary/90 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Submit text="Login" pendingText="Logging..." />
      </form>
    </div>
  )
}