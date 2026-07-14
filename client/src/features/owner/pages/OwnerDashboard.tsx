import { useState } from "react";
import { 
  IndianRupee, 
  CalendarRange, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import VerificationStatusCard, { type VerificationState } from "../components/dashboard/VerificationStatusCard";
import { useAuthStore } from "../../auth/store/authStore";

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  
  // Interactive preview state switcher for testing the redesign states
  const [previewState, setPreviewState] = useState<VerificationState | "LIVE">("LIVE");

  // Get active state for dashboard content rendering
  const activeState: VerificationState = 
    previewState === "LIVE" 
      ? (user?.isVerified 
          ? "VERIFIED" 
          : (!user?.onboardingStep || user.onboardingStep < 4 ? "NOT_SUBMITTED" : "PENDING_REVIEW"))
      : previewState;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 animate-in fade-in duration-300">
      
      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60 text-left">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Owner Dashboard</h1>
          <p className="text-xs text-slate-400 font-semibold">
            Manage your wash station operations, team members, and financials.
          </p>
        </div>
      </div>

      {/* Redesigned Verification Status Card */}
      <VerificationStatusCard 
        forcedState={previewState === "LIVE" ? undefined : previewState} 
      />

      {/* Operational Metrics Grid */}
      <div className="space-y-4 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Operational Summary
          </span>
          {activeState !== "VERIFIED" && (
            <span className="inline-flex items-center gap-1 text-[9px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10 font-bold">
              <AlertCircle size={10} />
              <span>Simulated Data (Verification Required)</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric 1: Revenue */}
          <div className={`relative overflow-hidden border border-slate-850 rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 ${
            activeState === "VERIFIED" 
              ? "bg-slate-950/20 hover:border-slate-800" 
              : "bg-slate-950/10 opacity-60 filter blur-[0.5px]"
          }`}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
              <IndianRupee size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-black text-slate-100 mt-1">
                {activeState === "VERIFIED" ? "₹14,850.00" : "₹0.00"}
              </p>
            </div>
          </div>

          {/* Metric 2: Bookings */}
          <div className={`relative overflow-hidden border border-slate-850 rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 ${
            activeState === "VERIFIED" 
              ? "bg-slate-950/20 hover:border-slate-800" 
              : "bg-slate-950/10 opacity-60 filter blur-[0.5px]"
          }`}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-primary border border-blue-500/20 flex items-center justify-center shrink-0 shadow-sm">
              <CalendarRange size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Bookings Completed</p>
              <p className="text-2xl font-black text-slate-100 mt-1">
                {activeState === "VERIFIED" ? "38 washes" : "0"}
              </p>
            </div>
          </div>

          {/* Metric 3: Active Queue */}
          <div className={`relative overflow-hidden border border-slate-850 rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 ${
            activeState === "VERIFIED" 
              ? "bg-slate-950/20 hover:border-slate-800" 
              : "bg-slate-950/10 opacity-60 filter blur-[0.5px]"
          }`}>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0 shadow-sm">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active Queue</p>
              <p className="text-2xl font-black text-slate-100 mt-1">
                {activeState === "VERIFIED" ? "3 Stations" : "0 Stations"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dev Preview Helper Toolbar */}
      <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-800 pr-3">
          Dev Preview
        </span>
        <div className="flex items-center gap-1.5">
          {(["NOT_SUBMITTED", "PENDING_REVIEW", "VERIFIED", "REJECTED", "LIVE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setPreviewState(s)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                previewState === s
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-slate-950/40 text-slate-400 hover:bg-slate-950/80 hover:text-slate-200"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}