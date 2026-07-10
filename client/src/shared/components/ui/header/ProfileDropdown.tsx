import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  LogOut,
  Settings,
  ShieldCheck,
  Calendar,
  CreditCard,
  ChevronRight,
  Headphones,
  HelpCircle,
  AlertTriangle,
  UserPlus
} from "lucide-react";
import { useAuthStore } from "../../../../features/auth/store/authStore";

interface ProfileDropdownProps {
  currentRole: "admin" | "manager" | "owner" | "customer";
}

export default function ProfileDropdown({ currentRole }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  if (!user) return null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleLabel = () => {
    switch (currentRole) {
      case "admin":
        return "System Admin";
      case "manager":
        return "Station Manager";
      case "owner":
        return "Verified Owner";
      case "customer":
        return "Verified User";
      default:
        return "User Access";
    }
  };

  const getCtaContent = () => {
    switch (currentRole) {
      case "admin":
        return {
          title: "System Analytics",
          desc: "Monitor platform performance"
        };
      case "manager":
        return {
          title: "Walk-in Queue",
          desc: "Add new walk-in wash"
        };
      case "owner":
        return {
          title: "Manage Station Bays",
          desc: "List and activate bays"
        };
      default:
        return {
          title: "Become an Owner",
          desc: "List your service and earn"
        };
    }
  };

  const cta = getCtaContent();

  const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "U";

  return (
    <div className="relative" ref={containerRef}>
      {/* Avatar Trigger Button with Double Ring Border Accent */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shadow-sm ring-2 ring-background ring-offset-2 ring-offset-primary cursor-pointer"
      >
        {initials}
      </button>

      {/* Profile Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 max-w-[90vw] origin-top-right rounded-2xl border border-border/80 bg-card shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden z-50 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-3 duration-200">

          {/* Header Section */}
          <div className="flex p-6 pb-4 justify-between items-start border-b border-border/40">
            <div className="flex items-center gap-4">
              {/* Avatar Double-Ring Design */}
              <div className="relative h-16 w-16 rounded-full border-2 border-background ring-2 ring-primary bg-muted flex items-center justify-center font-bold text-foreground text-xl shadow-md">
                {initials}
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card bg-emerald-500"></span>
              </div>

              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-foreground leading-tight">{user.name}</h2>
                <span className="text-xs text-muted-foreground">{user.email}</span>

                {/* Verified Badge */}
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 mt-2 uppercase w-fit tracking-wider">
                  <ShieldCheck className="h-3 w-3" />
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate(currentRole === "customer" ? "/settings" : `/${currentRole}/settings`);
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all cursor-pointer"
              title="Profile Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-6 py-4 space-y-4 max-h-[400px]">

            {/* Quick Actions (My Bookings & Wallet Cards) */}
            <div className="space-y-2">
              {/* My Bookings Card */}
              <div
                onClick={() => {
                  setIsOpen(false);
                  navigate(currentRole === "customer" ? "/bookings" : `/${currentRole}/bookings`);
                }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border/60 text-primary group-hover:scale-105 transition-transform">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">My Bookings</span>
                    <span className="text-[11px] text-muted-foreground">Track current and previous</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-md uppercase tracking-wider">
                  2 Active
                </span>
              </div>

              {/* Wallet Card */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border/60 text-primary group-hover:scale-105 transition-transform">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Wallet</span>
                    <span className="text-[11px] text-muted-foreground">Refunds, balance, and transactions</span>
                  </div>
                </div>

                <span className="text-sm font-bold text-foreground">₹2,450</span>
              </div>
            </div>

            {/* Owner Section CTA */}
            <div
              onClick={() => {
                setIsOpen(false);
                navigate(currentRole === "customer" ? "/owner/onboarding" : `/${currentRole}/dashboard`);
              }}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 hover:from-primary/20 transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Background Glow Dec */}
              <div className="absolute right-[-15px] bottom-[-15px] h-20 w-20 rounded-full bg-primary/10 filter blur-xl"></div>

              <div className="flex items-center gap-4 z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{cta.title}</span>
                  <span className="text-[11px] text-primary/80">{cta.desc}</span>
                </div>
              </div>

              <ChevronRight className="h-4.5 w-4.5 text-primary group-hover:translate-x-1 transition-transform z-10" />
            </div>

            {/* Utilities Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl text-left border border-border/40 transition-colors text-xs font-semibold text-foreground cursor-pointer">
                <Headphones className="h-4 w-4 text-muted-foreground" />
                Support
              </button>
              <button className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl text-left border border-border/40 transition-colors text-xs font-semibold text-foreground cursor-pointer">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Help Center
              </button>
              <button className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl text-left border border-border/40 transition-colors text-xs font-semibold text-foreground cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                Report Issue
              </button>
              <button className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl text-left border border-border/40 transition-colors text-xs font-semibold text-foreground cursor-pointer">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                Invite Friends
              </button>
            </div>

          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-end p-4 bg-muted/20 border-t border-border/40">
            {/* Logout Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
            >
              Logout
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
