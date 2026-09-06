import { useEffect } from "react"
import { getSocketClient } from "@/shared/services/socket.client"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { useReviewModalStore } from "../store/review-modal.store"
import { reviewApi } from "@/shared/apis/review.api"
import { ROLE } from "@/shared/constants/role.const"

interface HandoverSocketPayload {
  eventType?: string
  bookingId?: string
  bookingNumber?: string
  stationId?: string
  stationName?: string
  serviceType?: string
  timestamp?: string
  metadata?: {
    stationName?: string
    stationImage?: string
    slotDate?: string
    slotStartTime?: string
  }
}

export function useReviewSocketListener() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const openReviewModal = useReviewModalStore((state) => state.openReviewModal)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    // Customers only should receive the review rating prompt modal
    if (user.role && user.role !== ROLE.CUSTOMER) return

    const socket = getSocketClient()

    // Join user room explicitly
    socket.emit("join_user", { userId: user.id })

    const handleHandoverEvent = async (payload: HandoverSocketPayload) => {
      if (!payload || !payload.bookingId) return

      try {
        // Verify booking hasn't been reviewed yet
        const existingReview = await reviewApi.getByBooking(payload.bookingId)
        if (existingReview) return

        const formattedDate = payload.timestamp
          ? new Date(payload.timestamp).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : new Date().toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })

        openReviewModal({
          bookingId: payload.bookingId,
          stationId: payload.stationId || "",
          stationName: payload.metadata?.stationName || payload.stationName,
          stationImage: payload.metadata?.stationImage,
          serviceType: payload.serviceType || "Car Wash Service",
          dateTime: formattedDate,
          bookingNumber: payload.bookingNumber,
        })
      } catch (err) {
        console.error("Failed to check existing review on handover:", err)
      }
    }

    socket.on("HANDOVER_COMPLETED", handleHandoverEvent)
    socket.on("BOOKING_COMPLETED", handleHandoverEvent)

    return () => {
      socket.off("HANDOVER_COMPLETED", handleHandoverEvent)
      socket.off("BOOKING_COMPLETED", handleHandoverEvent)
    }
  }, [isAuthenticated, user?.id, user?.role, openReviewModal])
}
