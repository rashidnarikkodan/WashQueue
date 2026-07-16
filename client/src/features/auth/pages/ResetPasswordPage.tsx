import { useRef, useState, useEffect } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import Loading from "../../../shared/components/ui/Loading";
import { useAuthStore } from "../store/authStore";
import FormInput from "../../../shared/components/form/FormInput";
import { toast } from "sonner";
import PasswordStrength from "@/shared/components/ui/PasswordStrength";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from localStorage where it was saved during forgot password request
  useEffect(() => {
    const savedEmail = localStorage.getItem("wq_reset_email");
    if (!savedEmail) {
      toast.error("Password reset session not found. Please request a new code.");
      navigate("/forgot-password");
      return;
    }
    setEmail(savedEmail);
  }, [navigate]);

  const handleDigitChange = (index: number, val: string) => {
    const lastChar = val.slice(-1);
    if (/^[0-9]$/.test(lastChar) || lastChar === "") {
      const nextDigits = [...otpDigits];
      nextDigits[index] = lastChar;
      setOtpDigits(nextDigits);

      if (lastChar !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otpDigits[index] === "" && index > 0) {
        const nextDigits = [...otpDigits];
        nextDigits[index - 1] = "";
        setOtpDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
        e.preventDefault();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const newDigits = pasteData.split("");
      setOtpDigits(newDigits);
      inputRefs.current[5]?.focus();
      toast.success("Code pasted successfully!");
    } else {
      toast.error("Please paste a valid 6-digit code");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const code = otpDigits.join("");
    if (code.length < 6) {
      newErrors.code = "Please enter the complete 6-digit verification code";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "New password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const code = otpDigits.join("");
    const success = await resetPassword(email, code, password);
    if (success) {
      navigate('/login')
      toast.success("Password reset successfully!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8 relative overflow-hidden w-full transition-colors duration-300">
      {/* Background Decor Glow */}
      <div className="absolute left-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-primary/5 filter blur-3xl"></div>

      <main className="flex-grow flex items-center justify-center z-10 p-4">

        <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-4 self-start w-fit group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>

          {/* Header Title Section */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Enter the 6-digit verification code sent to <strong className="text-foreground">{email}</strong> and set your new password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Digits inputs */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block text-center">
                Verification Code
              </label>
              <div className="flex justify-center gap-2.5 md:gap-4">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-12 h-12 md:w-14 md:h-14 bg-muted/50 border border-border rounded-xl text-center font-extrabold text-foreground text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    autoFocus={i === 0}
                    disabled={isLoading}
                  />
                ))}
              </div>
              {errors.code && (
                <p className="text-xs text-destructive text-center mt-1">{errors.code}</p>
              )}
            </div>

            {/* Password inputs */}
            <div className="space-y-4">
              <FormInput
                id="new-password"
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.password;
                      return copy;
                    });
                  }
                }}
                error={errors.password}
                required
              />
              <PasswordStrength password={password} />
              

              <FormInput
                id="confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.confirmPassword;
                      return copy;
                    });
                  }
                }}
                error={errors.confirmPassword}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
