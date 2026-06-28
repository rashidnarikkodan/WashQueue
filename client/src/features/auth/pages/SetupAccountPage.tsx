import { useNavigate } from "react-router-dom";
import { Car, Wrench, Loader2, Check } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { ROLE } from "../../../shared/constants/role.const";
import { useState } from "react";

export default function SetupAccountPage() {
  const navigate = useNavigate();
  const { setupAccount, isLoading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<typeof ROLE.CUSTOMER | typeof ROLE.PROVIDER | null>(null);

  const handleSelectRole = async (role: typeof ROLE.CUSTOMER | typeof ROLE.PROVIDER) => {
    setSelectedRole(role);
    const success = await setupAccount(role);
    if (success) {
      if (role === ROLE.CUSTOMER) {
        navigate("/");
      } else {
        navigate("/provider/onboarding");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-6 sm:p-8 md:p-12 relative overflow-hidden w-full transition-colors duration-300">
      
      {/* Background Decor Glows */}
      <div className="absolute left-[-10%] top-[-10%] h-[350px] w-[350px] rounded-full bg-primary/5 filter blur-3xl pointer-events-none"></div>
      <div className="absolute right-[-10%] bottom-[-10%] h-[400px] w-[400px] rounded-full bg-primary/5 filter blur-3xl pointer-events-none"></div>

      {/* Main Selection Area - Two-Column Split Layout */}
      <main className="flex-grow flex items-center justify-center z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column: Email Verified Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-6 py-6 lg:py-12 animate-in slide-in-from-left duration-500">
            {/* Animated Checkmark Circle */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5 animate-pulse">
              <Check className="h-10 w-10 stroke-[3]" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
                Email Verified Successfully
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                Your account is now active.
              </p>
            </div>
          </div>
          
          {/* Right Column: Setup Container Panel */}
          <div className="lg:col-span-7 bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 animate-in slide-in-from-right duration-500">
            
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Set Up Your Account
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                How would you like to use WashQueue?
              </p>
            </div>

            {/* Role Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              
              {/* Role 1: Customer Card */}
              <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-border/80 bg-slate-950/20 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group">
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                    <Car className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-foreground">Book Washes</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Find nearby wash stations and check live queue status.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectRole(ROLE.CUSTOMER)}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all duration-200 mt-6 text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading && selectedRole === ROLE.CUSTOMER ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    "Continue as customer"
                  )}
                </button>
              </div>

              {/* Role 2: Provider Card */}
              <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-border/80 bg-slate-950/20 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group">
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-foreground">List My Wash Station</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Manage bookings, queues, and customers from your dashboard.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectRole(ROLE.PROVIDER)}
                  disabled={isLoading}
                  className="w-full border border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed text-primary font-bold py-3 px-4 rounded-xl transition-all duration-200 mt-6 text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading && selectedRole === ROLE.PROVIDER ? (
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

            {/* Footer switch prompt */}
            <p className="text-center text-xs text-muted-foreground font-medium pt-2">
              You can switch roles later from your profile settings.
            </p>

          </div>
          
        </div>
      </main>
      
    </div>
  );
}
