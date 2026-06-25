import { useActionState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"

import FormInput from "./FormInput"
import SocialButton from "./SocialButton"
import Submit from "./Submit"
import { loginAction } from "../../actions/login.action"

const initialState = {
  success: false,
}

export default function LoginForm() {
  const navigate = useNavigate()

  const [state, formAction] = useActionState(
    loginAction,
    initialState
  )

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
        <h1 className="text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Login
        </h1>

        <p className="text-sm text-slate-400 font-medium">
          Start managing your vehicle wash bookings
        </p>
      </div>

      <SocialButton
        label="Sign in with Google"
        onClick={() => {
          toast.promise(
            new Promise((resolve) =>
              setTimeout(resolve, 800)
            ),
            {
              loading: "Connecting with Google...",
              success: "Signed in with Google!",
              error: "Google login failed",
            }
          )
        }}
      />

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1 h-[1px] bg-slate-800/80"></div>

        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
          or email
        </span>

        <div className="flex-1 h-[1px] bg-slate-800/80"></div>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <FormInput
          id="email-input"
          label="Email Address"
          type="email"
          name="email"
          placeholder="e.g. rashid@example.com"
          error={state.errors?.email?.[0]}
          autoComplete="username"
          required
        />

        <FormInput
          id="password-input"
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          error={state.errors?.password?.[0]}
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