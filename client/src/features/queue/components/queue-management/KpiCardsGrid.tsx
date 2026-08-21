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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          TODAY&apos;S BOOKINGS
        </span>
        <div className="text-4xl font-extrabold text-primary">
          {isLoading ? "..." : bookingsCount}
        </div>
        <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
          <span>+12% from yesterday</span>
        </p>
      </div>

      <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          ACTIVE QUEUE DEPTH
        </span>
        <div className="text-4xl font-extrabold text-primary">
          {isLoading ? "..." : liveQueueData ? liveQueueData.queueDepth : activeQueueCount}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            Est. Wait:{" "}
            {liveQueueData
              ? `${Math.ceil((liveQueueData.queueDepth / (liveQueueData.totalBays || 1)) * liveQueueData.averageWashDurationMinutes)}m`
              : `${estimatedWaitMinutes}m`}
          </span>
        </p>
      </div>

      <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          STATION BAYS
        </span>
        <div className="text-4xl font-extrabold text-primary">
          {liveQueueData
            ? `${liveQueueData.activeServicesCount}/${liveQueueData.totalBays}`
            : "1/1"}
        </div>
        <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
          <span>
            {liveQueueData ? `${liveQueueData.availableBays} bays available` : "Capacity Ok"}
          </span>
        </p>
      </div>

      <div
        onClick={onCheckInClick}
        className="rounded-3xl bg-card text-card-foreground p-6 border border-primary/40 hover:border-primary transition-all cursor-pointer space-y-3 flex flex-col justify-between group shadow-md shadow-primary/5"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
            NEW CHECK-IN
          </span>
          <QrCode className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Scan QR code or enter Booking ID to check in arriving customers.
        </p>
        <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Scan / Check-in <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  )
}
