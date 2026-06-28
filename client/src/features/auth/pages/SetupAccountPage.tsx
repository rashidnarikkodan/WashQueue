import { useNavigate, Link } from "react-router-dom";
import { Droplets, Car, Wrench, ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";

export default function SetupAccountPage() {
  const navigate = useNavigate();
  const { setupAccount, isLoading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<"user" | "provider" | null>(null);

  const handleSelectRole = async (role: "user" | "provider") => {
    setSelectedRole(role);
    const success = await setupAccount(role);
    if (success) {
      if (role === "user") {
        navigate("/");
      } else {
        navigate("/provider/dashboard");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8 relative overflow-hidden w-full">
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

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Go Back
        </button>
      </header>

      {/* Main Selection Area */}
      <main className="flex-grow flex items-center justify-center z-10 p-4">
        <div className="w-full max-w-4xl bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl p-8 md:p-12 space-y-10 shadow-2xl animate-in zoom-in duration-300">
          
          {/* Header Title Section */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
              Set Up Your Account
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              How would you like to use WashQueue?
            </p>
          </div>

          {/* Cards Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Customer */}
            <div className="flex flex-col justify-between p-8 rounded-xl border border-border/80 bg-card/40 hover:border-primary/50 transition-all duration-300 scale-100 hover:scale-[1.02] group">
              <div className="space-y-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                  <Car className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Book Washes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Find nearby wash stations and check live queue status.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSelectRole("user")}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all duration-200 mt-8 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading && selectedRole === "user" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Continue as User"
                )}
              </button>
            </div>

            {/* Card 2: Provider */}
            <div className="flex flex-col justify-between p-8 rounded-xl border border-border/80 bg-card/40 hover:border-primary/50 transition-all duration-300 scale-100 hover:scale-[1.02] group">
              <div className="space-y-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Wrench className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">List My Wash Station</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Manage bookings, queues, and customers from your dashboard.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSelectRole("provider")}
                disabled={isLoading}
                className="w-full border border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed text-primary font-bold py-3 px-6 rounded-xl transition-all duration-200 mt-8 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading && selectedRole === "provider" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Start Provider Setup"
                )}
              </button>
            </div>
          </div>

          {/* Bottom Info Prompt */}
          <p className="text-center text-xs text-muted-foreground font-medium">
            You can switch roles later from your profile settings.
          </p>

        </div>
      </main>
    </div>
  );
}
