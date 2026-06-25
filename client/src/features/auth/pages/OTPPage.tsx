import { useRef, useEffect, useState } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useAuthFormStore } from "../store/authFormStore";
import { toast } from "sonner";

export default function OTPPage() {
  const navigate = useNavigate();
  const { verifyOTP, isLoading } = useAuthStore();
  const { otpDigits, setOtpDigit, setOtpDigits, resetForm } = useAuthFormStore();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend code countdown timer
  const [timerCount, setTimerCount] = useState(25);
  const [isResendActive, setIsResendActive] = useState(false);

  // Success Verification Modal
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendActive(true);
    }
    return () => clearInterval(interval);
  }, [timerCount]);

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  // Reactive verification: Auto-submits when all 6 digits are entered
  useEffect(() => {
    const code = otpDigits.join("");
    if (code.length === 6 && !isLoading && !isVerified) {
      const triggerVerify = async () => {
        const success = await verifyOTP(code);
        if (success) {
          setIsVerified(true);
        }
      };
      triggerVerify();
    }
  }, [otpDigits, verifyOTP, isLoading, isVerified]);

  // Auto-redirect to role setup on successful verification after a brief delay
  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        navigate("/setup-account");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isVerified, navigate]);

  const handleDigitChange = (index: number, val: string) => {
    // Take the last character entered to allow overwriting of values smoothly
    const lastChar = val.slice(-1);
    if (/^[0-9]$/.test(lastChar) || lastChar === "") {
      setOtpDigit(index, lastChar);

      // Move focus forward if value entered
      if (lastChar !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otpDigits[index] === "" && index > 0) {
        // Current input is already empty, move focus to previous and clear it
        setOtpDigit(index - 1, "");
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
      // Focus the last input box
      inputRefs.current[5]?.focus();
      toast.success("Verification code pasted successfully!");
    } else {
      toast.error("Please paste a valid 6-digit verification code");
    }
  };

  const handleResend = () => {
    if (isResendActive) {
      setTimerCount(59);
      setIsResendActive(false);
      toast.success("A new verification code has been sent!");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length === 6) {
      const success = await verifyOTP(code);
      if (success) {
        setIsVerified(true);
      }
    }
  };

  const formatTimer = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020817] text-white p-8 relative overflow-hidden w-full">
      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center z-10 p-4">
        {!isVerified ? (
          <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header Title Section */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Confirm Email
              </h1>
              <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
                Enter the 6-digit verification code sent to your registered email.
              </p>
            </div>

            {/* OTP Digits inputs */}
            <form onSubmit={handleVerify} className="space-y-8">
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
                    className="w-12 h-12 md:w-16 md:h-16 bg-slate-950/40 border border-slate-800 rounded-xl text-center font-extrabold text-white text-lg md:text-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    autoFocus={i === 0}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* Submit Verification */}
              <div className="space-y-4 max-w-sm mx-auto">
                <button
                  type="submit"
                  disabled={otpDigits.join("").length < 6 || isLoading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>

                {/* Resend status & triggers */}
                <div className="text-center space-y-1">
                  {!isResendActive ? (
                    <span className="text-xs text-slate-500 block">
                      Resend available in {formatTimer(timerCount)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-xs font-bold text-primary hover:text-primary/90 transition-colors cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Verification Success Modal State */
          <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 space-y-6 text-center shadow-2xl animate-in zoom-in duration-300 z-20">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shadow-inner relative">
                <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-75"></span>
                <Check className="h-8 w-8 stroke-[3] relative z-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Email Verified
              </h2>
              <p className="text-sm text-slate-400">Your account setup is ready for role assignment.</p>
            </div>

            <button
              onClick={() => navigate("/setup-account")}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer text-sm"
            >
              Continue to Role Setup
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
