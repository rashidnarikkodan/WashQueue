import { Clock, QrCode, ArrowRight } from "lucide-react"
import type { LiveQueueData } from "./types"

interface KpiCardsGridProps {
  isLoading: boolean
  bookingsCount: number
  liveQueueData: LiveQueueData | null
  activeQueueCount: number
  estimatedWaitMinutes: number
  onCheckInClick: () => void
}

export function KpiCardsGrid({
  isLoading,
  bookingsCount,
  liveQueueData,
  activeQueueCount,
  estimatedWaitMinutes,
  onCheckInClick,
}: KpiCardsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
      <div className="rounded-xl sm:rounded-3xl bg-card text-card-foreground p-3.5 sm:p-6 border border-border space-y-1.5 sm:space-y-3 flex flex-col justify-between shadow-xs sm:shadow-sm">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
          TODAY&apos;S BOOKINGS
        </span>
        <div className="text-2xl sm:text-4xl font-extrabold text-primary">
          {isLoading ? "..." : bookingsCount}
        </div>
        <p className="text-[10px] sm:text-xs text-emerald-500 font-semibold flex items-center gap-1 truncate">
          <span>+12% from yesterday</span>
        </p>
      </div>

      <div className="rounded-xl sm:rounded-3xl bg-card text-card-foreground p-3.5 sm:p-6 border border-border space-y-1.5 sm:space-y-3 flex flex-col justify-between shadow-xs sm:shadow-sm">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
          ACTIVE QUEUE
        </span>
        <div className="text-2xl sm:text-4xl font-extrabold text-primary">
          {isLoading ? "..." : liveQueueData ? liveQueueData.queueDepth : activeQueueCount}
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 truncate">
          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">
            Wait:{" "}
            {liveQueueData
              ? `${Math.ceil((liveQueueData.queueDepth / (liveQueueData.totalBays || 1)) * liveQueueData.averageWashDurationMinutes)}m`
              : `${estimatedWaitMinutes}m`}
          </span>
        </p>
      </div>

      <div className="rounded-xl sm:rounded-3xl bg-card text-card-foreground p-3.5 sm:p-6 border border-border space-y-1.5 sm:space-y-3 flex flex-col justify-between shadow-xs sm:shadow-sm">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
          STATION BAYS
        </span>
        <div className="text-2xl sm:text-4xl font-extrabold text-primary">
          {liveQueueData
            ? `${liveQueueData.activeServicesCount}/${liveQueueData.totalBays}`
            : "1/1"}
        </div>
        <p className="text-[10px] sm:text-xs text-emerald-500 font-semibold flex items-center gap-1 truncate">
          <span>{liveQueueData ? `${liveQueueData.availableBays} available` : "Capacity Ok"}</span>
        </p>
      </div>

      <div
        onClick={onCheckInClick}
        className="rounded-xl sm:rounded-3xl bg-card text-card-foreground p-3.5 sm:p-6 border border-primary/40 hover:border-primary transition-all cursor-pointer space-y-1.5 sm:space-y-3 flex flex-col justify-between group shadow-xs sm:shadow-md shadow-primary/5"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider sm:tracking-widest text-primary truncate">
            NEW CHECK-IN
          </span>
          <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:scale-110 transition-transform shrink-0" />
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium line-clamp-2 sm:line-clamp-none">
          Scan QR code or enter Booking ID.
        </p>
        <span className="text-[10px] sm:text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Check-in <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </span>
      </div>
    </div>
  )
}
