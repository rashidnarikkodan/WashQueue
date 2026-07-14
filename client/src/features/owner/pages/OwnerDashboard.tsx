import {
  TrendingUp,
  IndianRupee,
  CalendarRange,
} from "lucide-react";

export default function OwnerDashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 animate-in fade-in duration-300">
      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60 text-left">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Owner Dashboard</h1>
          <p className="text-sm text-slate-400 font-medium">
            Manage your wash station operations, team members, and financials.
          </p>
        </div>
      </div>

      {/* Main Verified Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Revenue */}
        <div className="border border-slate-850 bg-slate-950/20 rounded-2xl p-6 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-white mt-0.5">₹0.00</p>
          </div>
        </div>

        {/* Metric 2: Bookings */}
        <div className="border border-slate-850 bg-slate-950/20 rounded-2xl p-6 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-primary border border-blue-500/20 flex items-center justify-center">
            <CalendarRange size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings Completed</p>
            <p className="text-2xl font-black text-white mt-0.5">0</p>
          </div>
        </div>

        {/* Metric 3: Operations */}
        <div className="border border-slate-850 bg-slate-950/20 rounded-2xl p-6 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Queue</p>
            <p className="text-2xl font-black text-white mt-0.5">0 Stations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
