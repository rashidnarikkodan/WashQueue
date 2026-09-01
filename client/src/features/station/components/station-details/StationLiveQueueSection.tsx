import { useState, useEffect, useCallback } from "react"
import { Sparkles, Car, AlertCircle, RefreshCw } from "lucide-react"
import { stationApi } from "@/shared/apis/station.api"
import { getSocketClient } from "@/shared/services/socket.client"

interface StationLiveQueueSectionProps {
  stationId?: string
}

interface PublicQueueItem {
  id: string
  bookingNumber: string
  position?: number
  bayNumber?: number
  vehicle: string
  package: string
  serviceType: string
  status: string
  serviceStartedAt?: string
  estimatedWaitMinutes?: number
  estimatedServiceStart?: string
  isBayActive: boolean
}

interface PublicQueueData {
  stationId: string
  stationName: string
  totalBays: number
  activeServicesCount: number
  availableBays: number
  queueDepth: number
  totalActiveAndWaiting: number
  averageWashDurationMinutes: number
  activeServices: PublicQueueItem[]
  waitingQueue: PublicQueueItem[]
}

export function StationLiveQueueSection({ stationId }: StationLiveQueueSectionProps) {
  const [queueData, setQueueData] = useState<PublicQueueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nowMs] = useState(() => Date.now())

  const fetchLiveQueue = useCallback(async () => {
    if (!stationId) return
    try {
      setError(null)
      const data = await stationApi.getPublicLiveQueue(stationId)
      setQueueData(data)
    } catch (err: unknown) {
      console.error("Failed to load live station queue:", err)
      setError("Unable to sync live station queue.")
    } finally {
      setIsLoading(false)
    }
  }, [stationId])

  useEffect(() => {
    if (!stationId) return

    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchLiveQueue()
    })

    const socket = getSocketClient()
    socket.emit("join_station", { stationId })

    const handleRealtimeQueueUpdate = () => {
      fetchLiveQueue()
    }

    socket.on("QUEUE_UPDATED", handleRealtimeQueueUpdate)
    socket.on("BOOKING_CHECKED_IN", handleRealtimeQueueUpdate)
    socket.on("SERVICE_STARTED", handleRealtimeQueueUpdate)
    socket.on("SERVICE_COMPLETED", handleRealtimeQueueUpdate)
    socket.on("BOOKING_COMPLETED", handleRealtimeQueueUpdate)
    socket.on("BOOKING_CANCELLED", handleRealtimeQueueUpdate)
    socket.on("BOOKING_NO_SHOW", handleRealtimeQueueUpdate)

    return () => {
      ignore = true
      socket.emit("leave_station", { stationId })
      socket.off("QUEUE_UPDATED", handleRealtimeQueueUpdate)
      socket.off("BOOKING_CHECKED_IN", handleRealtimeQueueUpdate)
      socket.off("SERVICE_STARTED", handleRealtimeQueueUpdate)
      socket.off("SERVICE_COMPLETED", handleRealtimeQueueUpdate)
      socket.off("BOOKING_COMPLETED", handleRealtimeQueueUpdate)
      socket.off("BOOKING_CANCELLED", handleRealtimeQueueUpdate)
      socket.off("BOOKING_NO_SHOW", handleRealtimeQueueUpdate)
    }
  }, [stationId, fetchLiveQueue])

  const activeServices = queueData?.activeServices || []
  const waitingQueue = queueData?.waitingQueue || []
  const totalLiveVehicles = activeServices.length + waitingQueue.length
  const totalBays = queueData?.totalBays || 1

  const getElapsedString = (serviceStartedAt?: string) => {
    if (!serviceStartedAt) return "In Service"
    const elapsedMinutes = Math.max(
      1,
      Math.floor((nowMs - new Date(serviceStartedAt).getTime()) / (1000 * 60))
    )
    return `${elapsedMinutes}m elapsed`
  }

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Live Queue</h2>
          <div className="px-3 py-1 rounded-full border border-success/20 bg-success/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-success">
              Live Station Feed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground flex items-center gap-2">
            <span>Bays:</span>
            <strong className="text-foreground">
              {activeServices.length} / {totalBays} Active
            </strong>
          </div>

          <button
            type="button"
            onClick={fetchLiveQueue}
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
            title="Sync Live Queue"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-primary" : ""} />
          </button>
        </div>
      </div>

      {isLoading && !queueData ? (
        <div className="p-8 rounded-2xl border border-border bg-card/60 text-center space-y-3">
          <RefreshCw size={24} className="animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">
            Connecting to station live queue...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 text-center space-y-2">
          <AlertCircle size={20} className="text-destructive mx-auto" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      ) : totalLiveVehicles === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-card/80 text-center space-y-3 backdrop-blur-md shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 text-success flex items-center justify-center mx-auto">
            <Sparkles size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground">All Washing Bays Available</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              There are currently 0 vehicles waiting in queue. Drive in or book now for immediate
              service across {totalBays} service bay{totalBays > 1 ? "s" : ""}.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-bold">
              ✓ 0 Min Estimated Wait Time
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card/90 divide-y divide-border/60 overflow-hidden shadow-xl backdrop-blur-md">
          {activeServices.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl border border-success/30 bg-success/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-black uppercase text-success">BAY</span>
                  <span className="text-lg font-black text-success font-mono">
                    {item.bayNumber || 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <Car size={16} className="text-success" />
                      <span>{item.vehicle}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      #{item.bookingNumber}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.package} • {getElapsedString(item.serviceStartedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:self-center self-start">
                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-success/15 text-success border-success/30 flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-success animate-ping" />
                  <span>{item.status}</span>
                </span>
              </div>
            </div>
          ))}

          {waitingQueue.map((item, idx) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl border border-border bg-background flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-black uppercase text-muted-foreground">POS</span>
                  <span className="text-base font-black text-foreground font-mono">
                    #{item.position || idx + 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <Car size={16} className="text-primary" />
                      <span>{item.vehicle}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      #{item.bookingNumber}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.package} •{" "}
                    <strong className="text-warning font-semibold">
                      {item.estimatedWaitMinutes !== undefined && item.estimatedWaitMinutes > 0
                        ? `Est. wait ~${item.estimatedWaitMinutes}m`
                        : "Next in Line"}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:self-center self-start">
                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-warning/15 text-warning border-warning/30 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  <span>In Queue</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
