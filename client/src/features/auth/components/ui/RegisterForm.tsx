import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "./FormInput";
import SocialButton from "./SocialButton";
import { useAuth } from "../../store/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (val.length > 0 && val.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
    if (confirmPassword && val !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (val !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }

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

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const success = await register(name, email, password);
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
        <h1 className="text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Create account
        </h1>
        <p className="text-sm text-slate-400 font-medium">
          Start managing your vehicle wash bookings
        </p>
      </div>

      <SocialButton label="Sign up with Google" onClick={() => {
        const promise = new Promise((resolve) => setTimeout(resolve, 800));
        toast.promise(
          promise,
          {
            loading: 'Connecting with Google...',
            success: 'Registered with Google!',
            error: 'Google sign-up failed',
          }
        );
        promise.then(() => {
          navigate("/verify-email");
        });
      }} />

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1 h-[1px] bg-slate-800/80"></div>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">or email</span>
        <div className="flex-1 h-[1px] bg-slate-800/80"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="name-register-input"
          label="Full Name"
          type="text"
          placeholder="Rashid Narikkodan"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError("");
          }}
          error={nameError}
          autoComplete="name"
          required
        />

        <FormInput
          id="email-register-input"
          label="Email Address"
          type="email"
          placeholder="rashid@example.com"
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
          id="password-register-input"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          error={passwordError}
          autoComplete="new-password"
          required
        />

        <FormInput
          id="confirm-password-register-input"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          error={confirmPasswordError}
          autoComplete="new-password"
          required
        />

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
