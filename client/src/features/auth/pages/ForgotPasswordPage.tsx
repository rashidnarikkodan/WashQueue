import { useNavigate, Link } from "react-router-dom";
import { Droplets, ArrowLeft, Loader2 } from "lucide-react";
import FormInput from "../components/ui/FormInput";
import { useAuthFormStore } from "../store/authFormStore";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    forgotEmail,
    errors,
    setField,
    validateForgotPassword,
    resetForm,
    clearError
  } = useAuthFormStore();

  // Reset form inputs and errors when component unmounts
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForgotPassword()) return;

    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    toast.success("Verification OTP code sent successfully!");
    navigate("/verify-email");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020817] text-white p-8 relative overflow-hidden w-full">
      {/* Background Decor Glow */}
      <div className="absolute left-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-primary/5 filter blur-3xl"></div>
      
      {/* Top Header branding */}
      <header className="w-full flex items-center justify-between z-10 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Droplets className="h-4.5 w-4.5" />
          </div>
          <span className="text-xl font-bold italic tracking-tight text-primary">
            WashQueue
          </span>
        </Link>

        <Link
          to="/login"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center z-10 p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Title Section */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Please enter your registered email address
            </p>
          </div>

          {/* Form Input Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="forgot-email"
              label="Email Address"
              type="email"
              placeholder="e.g. rashid@example.com"
              value={forgotEmail}
              onChange={(e) => {
                setField("forgotEmail", e.target.value);
                clearError("forgotEmail");
              }}
              error={errors.forgotEmail}
              autoComplete="username"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
