import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormInput from "./FormInput";
import SocialButton from "./SocialButton";
import { useAuth } from "../../store/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (val.length > 0 && val.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  };

  const validateForm = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const success = await login(email, password);
      if (success) {
        if (email.startsWith("admin")) {
          navigate("/admin/dashboard");
        } else if (email.startsWith("manager")) {
          navigate("/manager/dashboard");
        } else if (email.startsWith("provider")) {
          navigate("/provider/dashboard");
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
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          error={emailError}
          autoComplete="username"
          required
        />

        <FormInput
          id="password-input"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          error={passwordError}
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
