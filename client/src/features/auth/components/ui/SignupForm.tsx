import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../../../shared/components/ui/FormInput";
import SocialButton from "./SocialButton";
import { useAuthStore } from "../../store/authStore";
import { useAuthFormStore } from "../../store/authFormStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import SubmitButton from "./Submit";

export default function SignupForm() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isLoading } = useAuthStore();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const success = await loginWithGoogle(tokenResponse.access_token);
      if (success) {
        navigate("/");
      }
    },
    onError: () => {
      toast.error("Google sign-up failed");
    }
  });

  const {
    name,
    email,
    password,
    confirmPassword,
    errors,
    setField,
    validateSignup,
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
    if (!validateSignup()) return;

    try {
      const success = await signup(name, email, password);
      if (success) {
        navigate("/verify-email");
      }
    } catch (err) {
      toast.error("Registration failed. Please try again.");
    }
  };

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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          id="name-signup-input"
          label="Full Name"
          type="text"
          placeholder="Rashid Narikkodan"
          value={name}
          onChange={(e) => {
            setField("name", e.target.value);
            clearError("name");
          }}
          error={errors.name}
          autoComplete="name"
          required
        />

        <FormInput
          id="email-signup-input"
          label="Email Address"
          type="email"
          placeholder="rashid@example.com"
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
          id="password-signup-input"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setField("password", e.target.value);
            clearError("password");
          }}
          error={errors.password}
          autoComplete="new-password"
          required
        />

        <FormInput
          id="confirm-password-signup-input"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => {
            setField("confirmPassword", e.target.value);
            clearError("confirmPassword");
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

          <SubmitButton text="Signup" />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer text-sm flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing Up...
            </>
          ) : (
            "Signup"
          )}
        </button>
      </form>
    </div>
  );
}
