import { useNavigate } from "react-router-dom";
import { Car, Wrench, Check, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { ROLE, VIEW_MODE } from "../../../shared/constants/role.const";

export default function SetupAccountPage() {
  const navigate = useNavigate();
  const { setActiveViewMode } = useAuthStore();

  const handleSelectRole = (role: typeof ROLE.CUSTOMER | typeof ROLE.OWNER) => {
    if (role === ROLE.CUSTOMER) {
      setActiveViewMode(VIEW_MODE.CUSTOMER);
      navigate("/");
    } else {
      setActiveViewMode(VIEW_MODE.OWNER);
      navigate("/owner/onboarding");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-6 sm:p-8 md:p-12 relative overflow-hidden w-full transition-colors duration-300">

      {/* Main Selection Area - Two-Column Split Layout */}
      <main className="flex-grow flex items-center justify-center z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-24 items-center w-full">

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
          <div className="lg:col-span-7 bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-6 sm:space-y-8 animate-in slide-in-from-right duration-500">

            <div className="space-y-1 sm:space-y-2 text-center lg:text-left">
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Set Up Your Account
              </h1>
              <p className="text-xs sm:text-base text-muted-foreground font-medium">
                How would you like to use WashQueue?
              </p>
            </div>

            {/* Desktop Role Selection Grid - Cards (visible on sm and up) */}
            <div className="hidden sm:grid grid-cols-2 gap-6 pt-2">
              {/* Role 1: Customer Card */}
              <div className="flex flex-col justify-between p-8 rounded-2xl border border-border/80 bg-background/20 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group">
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all duration-200 mt-6 text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  Continue as customer
                </button>
              </div>

              {/* Role 2: Owner Card */}
              <div className="flex flex-col justify-between p-8 rounded-2xl border border-border/80 bg-background/20 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group">
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
                  onClick={() => handleSelectRole(ROLE.OWNER)}
                  className="w-full border border-primary hover:bg-primary/10 text-primary font-bold py-3 px-4 rounded-xl transition-all duration-200 mt-6 text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  Start Owner Setup
                </button>
              </div>
            </div>

            {/* Mobile Role Selection List - Stacked Rows (visible only on mobile) */}
            <div className="block sm:hidden space-y-4 pt-2">
              {/* Option 1: Customer */}
              <button
                onClick={() => handleSelectRole(ROLE.CUSTOMER)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-background/20 hover:border-primary/50 hover:bg-background/40 transition-all duration-300 group text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Book Washes (Customer)</h3>
                    <p className="text-xs text-muted-foreground">
                      Find nearby wash stations and check live queue status.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </button>

              {/* Option 2: Owner */}
              <button
                onClick={() => handleSelectRole(ROLE.OWNER)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-background/20 hover:border-primary/50 hover:bg-background/40 transition-all duration-300 group text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">List Wash Station (Owner)</h3>
                    <p className="text-xs text-muted-foreground">
                      Manage bookings, queues, and dashboard.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </button>
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
