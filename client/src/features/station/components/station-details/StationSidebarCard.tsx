import { Star, Zap, CheckCircle2, XCircle, Edit, Layers } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Station } from "../../types"
import { STATION_STATUS } from "../../types"

interface StationSidebarCardProps {
  station: Station
  role?: "user" | "admin" | "owner"
  onApprove?: () => void
  onReject?: () => void
  isSubmittingAction?: boolean
}

export function StationSidebarCard({
  station,
  role = "user",
  onApprove,
  onReject,
  isSubmittingAction = false,
}: StationSidebarCardProps) {
  const navigate = useNavigate()

  const isPending = station.status === STATION_STATUS.PENDING_REVIEW

  return (
    <div className="space-y-6 sticky top-8">
      {/* Main Station Summary Card */}
      <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6">
        {/* Title & Status */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">
              {station.name}
            </h1>

            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1 text-emerald-400">
                <Star size={14} className="fill-emerald-400 text-emerald-400" />
                <span className="font-extrabold text-sm">{station.rating || "4.5"}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="uppercase tracking-widest text-[10px] font-black">Open Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center py-3 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-slate-400">Average Wait</span>
            <span className="text-lg font-black text-blue-400">12 Minutes</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-slate-400">Queue Depth</span>
            <span className="text-lg font-black text-slate-100">6 Vehicles</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-slate-400">Service Slots</span>
            <span className="text-lg font-black text-slate-100">
              {station.slotConfig?.bays || 2} Active
            </span>
          </div>
        </div>

        {/* ROLE-BASED ACTION CTA BUTTONS */}
        <div className="pt-2">
          {/* USER / CUSTOMER ROLE */}
          {role === "user" && (
            <button
              onClick={() => navigate(`/bookings/new?stationId=${station.id}`)}
              className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-base uppercase tracking-wider transition-all cursor-pointer shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Zap size={18} />
              Book Now
            </button>
          )}

          {/* ADMIN ROLE */}
          {role === "admin" && (
            <div className="space-y-3">
              {isPending ? (
                <>
                  <button
                    onClick={onApprove}
                    disabled={isSubmittingAction}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Approve Station
                  </button>
                  <button
                    onClick={onReject}
                    disabled={isSubmittingAction}
                    className="w-full py-3.5 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject Application
                  </button>
                </>
              ) : (
                <div className="w-full py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-bold text-xs uppercase tracking-wider text-center">
                  Status: {station.status}
                </div>
              )}
            </div>
          )}

          {/* OWNER ROLE */}
          {role === "owner" && (
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/owner/stations/new?editStationId=${station.id}`)}
                className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit Station Configurations
              </button>
              <button
                onClick={() => navigate("/owner/queues")}
                className="w-full py-3.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Layers size={16} />
                Manage Live Queue
              </button>
            </div>
          )}
        </div>

        {/* Hours of Operation */}
        <div className="pt-4 border-t border-slate-800/60 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hours of Operation
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Monday - Friday</span>
              <span className="font-bold text-slate-200 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                06:00 AM - 11:00 PM
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Saturday - Sunday</span>
              <span className="font-bold text-slate-200 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                08:00 AM - 10:00 PM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Disclaimer Footer */}
      <p className="text-[10px] text-slate-500 text-center leading-relaxed px-4">
        Prices and wait times are dynamic and subject to real-time traffic conditions. Service guarantees depend on real-time situations.
      </p>
    </div>
  )
}
