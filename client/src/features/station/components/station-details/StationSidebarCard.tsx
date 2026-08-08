import { Star, Zap, CheckCircle2, XCircle, Edit, Ban, UserCheck, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Station } from "../../types"
import { STATION_STATUS } from "../../types"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
import type { ManagerPermission } from "@/shared/apis/manager.api"

interface StationSidebarCardProps {
  station: Station
  role?: RoleType
  managerPermissions?: ManagerPermission[]
  onApprove?: () => void
  onReject?: () => void
  onSuspend?: () => void
  onToggleActive?: () => void
  onDelete?: () => void
  onOpenAssignManager?: () => void
  onBookNow?: () => void
  isSubmittingAction?: boolean
}

export function StationSidebarCard({
  station,
  role = "customer",
  managerPermissions = [],
  onApprove,
  onReject,
  onSuspend,
  onToggleActive,
  onDelete,
  onOpenAssignManager,
  onBookNow,
  isSubmittingAction = false,
}: StationSidebarCardProps) {
  const navigate = useNavigate()

  const isPending = station.status === STATION_STATUS.PENDING_REVIEW

  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      {/* Main Station Summary Card */}
      <div className="p-8 rounded-2xl bg-background shadow-2xl space-y-6">
        {/* Title & Status */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-forground tracking-tight">{station.name}</h1>

            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1 text-emerald-400">
                <Star size={14} className="fill-emerald-400 text-emerald-400" />
                <span className="font-extrabold text-sm">
                  {station.rating ? station.rating.toFixed(1) : "New"}
                </span>
              </div>
              <span className="text-forground">•</span>
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
            <span className="text-sm font-semibold text-forground">Slot Window</span>
            <span className="text-lg font-black text-blue-400">
              {station.slotConfig?.windowDurationMins
                ? `${station.slotConfig.windowDurationMins} Mins`
                : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-foreground">Window Capacity</span>
            <span className="text-lg font-black text-forground">
              {station.slotConfig?.capacityPerWindow
                ? `${station.slotConfig.capacityPerWindow} Slots`
                : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-forground">Service Bays</span>
            <span className="text-lg font-black text-forground">
              {station.slotConfig?.bays ? `${station.slotConfig.bays} Bays` : "N/A"}
            </span>
          </div>
        </div>

        {/* ROLE-BASED ACTION CTA BUTTONS */}
        <div className="pt-2">
          {/* USER / CUSTOMER ROLE */}
          {role === ROLE.CUSTOMER && (
            <button
              onClick={() => {
                if (onBookNow) {
                  onBookNow()
                } else {
                  navigate(`/bookings/new?stationId=${station.id}`)
                }
              }}
              className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-base uppercase tracking-wider transition-all cursor-pointer shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Zap size={18} />
              Book Now
            </button>
          )}

          {/* ADMIN ROLE */}
          {role === "admin" && (
            <div className="space-y-3">
              {isPending && (
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
              )}

              {station.status !== STATION_STATUS.SUSPENDED && (
                <button
                  onClick={onSuspend}
                  disabled={isSubmittingAction}
                  className="w-full py-3.5 rounded-xl border border-amber-500/30 hover:border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Ban size={16} />
                  Suspend Station
                </button>
              )}

              {station.status === STATION_STATUS.SUSPENDED && (
                <button
                  onClick={onApprove}
                  disabled={isSubmittingAction}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Reactivate Station
                </button>
              )}
            </div>
          )}

          {/* OWNER ROLE */}
          {role === ROLE.OWNER && (
            <div className="space-y-3">
              <button
                onClick={onOpenAssignManager}
                className="w-full py-3.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck size={16} />
                {station.managerId ? "Station Manager Assigned" : "+ Assign Station Manager"}
              </button>

              <button
                onClick={() => navigate(`/owner/stations/${station.id}/edit`)}
                className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit Station Configurations
              </button>

              {(station.status === STATION_STATUS.ACTIVE ||
                station.status === STATION_STATUS.INACTIVE) && (
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

              {(station.status === STATION_STATUS.DRAFT ||
                station.status === STATION_STATUS.REJECTED) && (
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

          {/* MANAGER ROLE */}
          {role === ROLE.MANAGER && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>Station Manager Control Panel</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {managerPermissions && managerPermissions.length > 0 ? (
                    managerPermissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-card border border-border text-foreground"
                      >
                        {perm.replace(/_/g, " ")}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      Standard Manager Access
                    </span>
                  )}
                </div>
              </div>

              {managerPermissions.includes("STATION_SETTINGS") ? (
                <button
                  onClick={() => navigate(`/manager/station/${station.id}/edit`)}
                  className="w-full py-3.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit Station Configurations
                </button>
              ) : (
                <p className="text-[11px] text-muted-foreground text-center font-medium italic">
                  Note: "Station Settings" permission required to edit configuration.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Hours of Operation */}
        <div className="pt-4 border-t border-slate-800/60 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-forground">
            Hours of Operation
          </span>

          {station.operatingHours && station.operatingHours.length > 0 ? (
            <div className="space-y-2 text-xs">
              {station.operatingHours.map((oh) => (
                <div key={oh.day} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-forground font-semibold capitalize">{oh.day}</span>
                    <span className="font-bold text-slate-200 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                      {oh.isClosed ? "Closed" : `${oh.open} - ${oh.close}`}
                    </span>
                  </div>
                  {!oh.isClosed && oh.breaks && oh.breaks.length > 0 && (
                    <div className="flex justify-between items-center text-[10px] text-amber-400 pl-2">
                      <span>Break:</span>
                      <span className="font-mono">
                        {oh.breaks
                          .map((b) =>
                            b.name ? `${b.name} (${b.start}-${b.end})` : `${b.start}-${b.end}`
                          )
                          .join(", ")}
                      </span>
                    </div>
                  )}
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
        Prices and wait times are dynamic and subject to real-time traffic conditions. Service
        guarantees depend on real-time situations.
      </p>
    </div>
  )
}
