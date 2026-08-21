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

interface GroupedOperatingHour {
  dayLabel: string
  timeLabel: string
  isClosed: boolean
  breaks?: Array<{ name?: string; start: string; end: string }>
}

function groupOperatingHours(operatingHours?: Station["operatingHours"]): GroupedOperatingHour[] {
  if (!operatingHours || operatingHours.length === 0) return []

  const dayOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

  // Map to ordered list
  const orderedList = [...operatingHours].sort((a, b) => {
    const aIdx = dayOrder.indexOf(a.day.toLowerCase())
    const bIdx = dayOrder.indexOf(b.day.toLowerCase())
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
  })

  // Create signature for each day to group matching schedules
  const getSignature = (oh: (typeof operatingHours)[0]) => {
    if (oh.isClosed) return "CLOSED"
    const breaksSig = (oh.breaks || []).map((b) => `${b.start}-${b.end}`).join("|")
    return `${oh.open}-${oh.close}#${breaksSig}`
  }

  // Check if all 7 days have identical schedule
  if (orderedList.length === 7) {
    const firstSig = getSignature(orderedList[0])
    const allSame = orderedList.every((item) => getSignature(item) === firstSig)
    if (allSame) {
      const first = orderedList[0]
      return [
        {
          dayLabel: "Everyday",
          timeLabel: first.isClosed ? "Closed" : `${first.open} - ${first.close}`,
          isClosed: Boolean(first.isClosed),
          breaks: first.breaks,
        },
      ]
    }
  }

  // Group consecutive days with the same signature
  const groups: GroupedOperatingHour[] = []
  let currentGroup: (typeof operatingHours)[0][] = []
  let currentSig: string | null = null

  const flushGroup = () => {
    if (currentGroup.length === 0) return
    const first = currentGroup[0]
    const last = currentGroup[currentGroup.length - 1]

    let dayLabel = capitalize(first.day)
    if (currentGroup.length === 7) {
      dayLabel = "Everyday"
    } else if (currentGroup.length > 1) {
      dayLabel = `${capitalize(first.day)} – ${capitalize(last.day)}`
    }

    groups.push({
      dayLabel,
      timeLabel: first.isClosed ? "Closed" : `${first.open} - ${first.close}`,
      isClosed: Boolean(first.isClosed),
      breaks: first.breaks,
    })
    currentGroup = []
  }

  for (const item of orderedList) {
    const sig = getSignature(item)
    if (currentSig === null) {
      currentSig = sig
      currentGroup.push(item)
    } else if (currentSig === sig) {
      currentGroup.push(item)
    } else {
      flushGroup()
      currentSig = sig
      currentGroup.push(item)
    }
  }
  flushGroup()

  return groups
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
            <h1 className="text-3xl font-black text-foreground tracking-tight">{station.name}</h1>

            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1 text-success">
                <Star size={14} className="fill-success text-success" />
                <span className="font-extrabold text-sm">
                  {station.rating ? station.rating.toFixed(1) : "New"}
                </span>
              </div>
              <span className="text-foreground">•</span>
              <div className="flex items-center gap-1.5 text-success">
                <span className="w-2 h-2 rounded-full bg-success animate-ping" />
                <span className="uppercase tracking-widest text-[10px] font-black">
                  {station.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center py-3 border-b border-border/60">
            <span className="text-sm font-semibold text-foreground">Slot Window</span>
            <span className="text-lg font-black text-primary">
              {station.slotConfig?.windowDurationMins
                ? `${station.slotConfig.windowDurationMins} Mins`
                : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border/60">
            <span className="text-sm font-semibold text-foreground">Window Capacity</span>
            <span className="text-lg font-black text-foreground">
              {station.slotConfig?.capacityPerWindow
                ? `${station.slotConfig.capacityPerWindow} Slots`
                : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border/60">
            <span className="text-sm font-semibold text-foreground">Service Bays</span>
            <span className="text-lg font-black text-foreground">
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
              className="w-full py-4 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-black text-base uppercase tracking-wider transition-all cursor-pointer shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
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
                    className="w-full py-3.5 rounded-xl bg-success hover:opacity-90 text-success-foreground font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-success/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Approve Station
                  </button>
                  <button
                    onClick={onReject}
                    disabled={isSubmittingAction}
                    className="w-full py-3.5 rounded-xl border border-destructive/30 hover:border-destructive bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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
                  className="w-full py-3.5 rounded-xl border border-warning/30 hover:border-warning bg-warning/10 hover:bg-warning/20 text-warning font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Ban size={16} />
                  Suspend Station
                </button>
              )}

              {station.status === STATION_STATUS.SUSPENDED && (
                <button
                  onClick={onApprove}
                  disabled={isSubmittingAction}
                  className="w-full py-3.5 rounded-xl bg-success hover:opacity-90 text-success-foreground font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-success/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
                className="w-full py-3.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck size={16} />
                {station.managerId ? "Station Manager Assigned" : "+ Assign Station Manager"}
              </button>

              <button
                onClick={() => navigate(`/owner/stations/${station.id}/edit`)}
                className="w-full py-3.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
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
                      ? "border border-warning/30 hover:border-warning bg-warning/10 hover:bg-warning/20 text-warning"
                      : "bg-success hover:opacity-90 text-success-foreground shadow-lg shadow-success/20"
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
                  className="w-full py-3.5 rounded-xl border border-destructive/30 hover:border-destructive bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="pt-4 border-t border-border/60 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
            Hours of Operation
          </span>

          {station.operatingHours && station.operatingHours.length > 0 ? (
            <div className="space-y-2 text-xs">
              {groupOperatingHours(station.operatingHours).map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-foreground font-semibold">{group.dayLabel}</span>
                    <span
                      className={`font-bold px-2.5 py-1 rounded border text-xs ${
                        group.isClosed
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-background text-foreground border-border font-mono"
                      }`}
                    >
                      {group.timeLabel}
                    </span>
                  </div>
                  {!group.isClosed && group.breaks && group.breaks.length > 0 && (
                    <div className="flex justify-between items-center text-[10px] text-warning pl-2">
                      <span>Break:</span>
                      <span className="font-mono">
                        {group.breaks
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
            <p className="text-xs text-muted-foreground italic">Not configured</p>
          )}
        </div>
      </div>

      {/* Dynamic Disclaimer Footer */}
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed px-4">
        Prices and wait times are dynamic and subject to real-time traffic conditions. Service
        guarantees depend on real-time situations.
      </p>
    </div>
  )
}
