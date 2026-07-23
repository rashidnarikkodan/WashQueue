import { Star, Zap, CheckCircle2, XCircle, Edit, Layers } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Station } from "../../types"
import { STATION_STATUS } from "../../types"
import { ROLE, type RoleType } from "@/shared/constants/role.const"

interface StationSidebarCardProps {
  station: Station
  role?: RoleType
  onApprove?: () => void
  onReject?: () => void
  onToggleActive?: () => void
  onDelete?: () => void
  isSubmittingAction?: boolean
}

export function StationSidebarCard({
  station,
  role = "customer",
  onApprove,
  onReject,
  onToggleActive,
  onDelete,
  isSubmittingAction = false,
}: StationSidebarCardProps) {
  const navigate = useNavigate()

  const isPending = station.status === STATION_STATUS.PENDING_REVIEW

  return (
    <div className="space-y-6 lg:sticky lg:top-24">
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
                <span className="font-extrabold text-sm">{station.rating ? station.rating.toFixed(1) : "New"}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="uppercase tracking-widest text-[10px] font-black">
                  {station.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center py-3 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-slate-400">Slot Window</span>
            <span className="text-lg font-black text-blue-400">
              {station.slotConfig?.windowDurationMins ? `${station.slotConfig.windowDurationMins} Mins` : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-slate-400">Window Capacity</span>
            <span className="text-lg font-black text-slate-100">
              {station.slotConfig?.capacityPerWindow ? `${station.slotConfig.capacityPerWindow} Slots` : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-slate-400">Service Bays</span>
            <span className="text-lg font-black text-slate-100">
              {station.slotConfig?.bays ? `${station.slotConfig.bays} Bays` : "N/A"}
            </span>
          </div>
        </div>

        {/* ROLE-BASED ACTION CTA BUTTONS */}
        <div className="pt-2">
          {/* USER / CUSTOMER ROLE */}
          {role === ROLE.CUSTOMER && (
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
          {role === ROLE.OWNER && (
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/owner/stations/${station.id}/edit`)}
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

              {(station.status === STATION_STATUS.ACTIVE || station.status === STATION_STATUS.INACTIVE) && (
                <button
                  onClick={onToggleActive}
                  disabled={isSubmittingAction}
                  className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                    station.isActive
                      ? "border border-amber-500/30 hover:border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                  }`}
                >
                  {station.isActive ? "Deactivate Station" : "Reactivate Station"}
                </button>
              )}

              {(station.status === STATION_STATUS.DRAFT || station.status === STATION_STATUS.REJECTED) && (
                <button
                  onClick={onDelete}
                  disabled={isSubmittingAction}
                  className="w-full py-3.5 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Delete Draft Station
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hours of Operation */}
        <div className="pt-4 border-t border-slate-800/60 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hours of Operation
          </span>

          {station.operatingHours && station.operatingHours.length > 0 ? (
            <div className="space-y-2 text-xs">
              {station.operatingHours.map((oh) => (
                <div key={oh.day} className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold capitalize">{oh.day}</span>
                  <span className="font-bold text-slate-200 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {oh.isClosed ? "Closed" : `${oh.open} - ${oh.close}`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Not configured</p>
          )}
        </div>
      </div>

      {/* Dynamic Disclaimer Footer */}
      <p className="text-[10px] text-slate-500 text-center leading-relaxed px-4">
        Prices and wait times are dynamic and subject to real-time traffic conditions. Service guarantees depend on real-time situations.
      </p>
    </div>
  )
}
