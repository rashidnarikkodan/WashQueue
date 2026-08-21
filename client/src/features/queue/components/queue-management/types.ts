import type { bookingApi } from "@/shared/apis/booking.api"

export type QueueFilter = "ALL" | "WAITING" | "IN_SERVICE" | "AWAITING_HANDOVER" | "STALLED"

export type LiveQueueData = Awaited<ReturnType<typeof bookingApi.getLiveQueue>>

export type QueueMetaItem = LiveQueueData["waitingQueue"][number]

export type FilterCounts = {
  all: number
  waiting: number
  inService: number
  handover: number
  stalled: number
}
