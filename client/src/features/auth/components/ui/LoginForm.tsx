import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormInput from "./FormInput";
import SocialButton from "./SocialButton";
import { useAuthStore } from "../../store/authStore";
import { useAuthFormStore } from "../../store/authFormStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { 
    email, 
    password, 
    errors, 
    setField, 
    validateLogin, 
    resetForm,
    clearError
  } = useAuthFormStore();

  // Reset form inputs and errors when component unmounts
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    try {
      const success = await login(email, password);
      if (success) {
        if (email.startsWith("admin")) {
          navigate("/admin");
        } else if (email.startsWith("manager")) {
          navigate("/manager");
        } else if (email.startsWith("provider")) {
          navigate("/provider");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      toast.error("Failed to login. Please try again.");
    }
  };

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

      <SocialButton label="Sign in with Google" onClick={() => {
        const promise = new Promise((resolve) => setTimeout(resolve, 800));
        toast.promise(
          promise,
          {
            loading: 'Connecting with Google...',
            success: 'Signed in with Google!',
            error: 'Google login failed',
          }
        );
        promise.then(() => {
          login("customer@washqueue.com", "password123").then(() => navigate("/"));
        });
      }} />

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1 h-[1px] bg-slate-800/80"></div>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">or email</span>
        <div className="flex-1 h-[1px] bg-slate-800/80"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="email-input"
          label="Email Address"
          type="email"
          placeholder="e.g. rashid@example.com"
          value={email}
          onChange={(e) => {
            setField("email", e.target.value);
            clearError("email");
          }}
          error={errors.email}
          autoComplete="username"
          required
        />

        <FormInput
          id="password-input"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setField("password", e.target.value);
            clearError("password");
          }}
          error={errors.password}
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer text-sm flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
