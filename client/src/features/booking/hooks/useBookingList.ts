import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { useAuthStore } from "@/features/auth/store/auth.store"
import { stationApi } from "@/shared/apis/station.api"

import { useBookingStore } from "../store/booking.store"
import type { BookingStatus } from "../types/booking.types"

export interface UseBookingListOptions {
  isManager?: boolean
  isOwner?: boolean
  isAdmin?: boolean
}

const LIMIT = 10

export function useBookingList({
  isManager = false,
  isOwner = false,
  isAdmin = false,
}: UseBookingListOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const ownerId = isOwner ? (user?.ownerId ?? user?.id) : undefined

  // A page that isn't opting into a management view (owner/manager/admin) is always the
  // customer's personal "My Bookings" list — it must show only bookings the user themself made,
  // never bookings tied to their owner/manager role, regardless of what role their account holds.
  const mine = !isManager && !isOwner && !isAdmin

  const [ownerStations, setOwnerStations] = useState<{ id: string; name: string }[]>([])

  const {
    bookings,
    pagination,
    isLoading,
    error,
    managedStation,
    isFetchingManagerStation,

    selectedBookingForQr,
    selectedBookingForCancel,
    cancellationReason,
    isSubmittingCancel,

    loadBookings,
    loadManagerStation,
    cancelBooking,

    setSelectedBookingForQr,
    setSelectedBookingForCancel,
    setCancellationReason,
  } = useBookingStore()

  const searchQuery = searchParams.get("q") ?? ""
  const activeTab = (searchParams.get("tab") as BookingStatus) ?? "ALL"
  const selectedStationId = searchParams.get("stationId") ?? "ALL"
  const dateFilter = searchParams.get("dateFilter") ?? "ALL"
  const page = Number(searchParams.get("page") ?? "1")
  const refetch = searchParams.get("refetch")

  const { startDate, endDate } = useMemo(() => {
    if (dateFilter === "TODAY") {
      const now = new Date()
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      ).toISOString()
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      ).toISOString()
      return { startDate: start, endDate: end }
    }
    if (dateFilter === "TOMORROW") {
      const now = new Date()
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      const start = new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        0,
        0,
        0,
        0
      ).toISOString()
      const end = new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        23,
        59,
        59,
        999
      ).toISOString()
      return { startDate: start, endDate: end }
    }
    if (dateFilter === "THIS_WEEK") {
      const now = new Date()
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay(),
        0,
        0,
        0,
        0
      ).toISOString()
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (6 - now.getDay()),
        23,
        59,
        59,
        999
      ).toISOString()
      return { startDate: start, endDate: end }
    }
    return { startDate: undefined, endDate: undefined }
  }, [dateFilter])

  useEffect(() => {
    if (!isAdmin && !isOwner) return
    if (isOwner && !ownerId) return

    let cancelled = false

    stationApi
      .getStations({
        limit: 100,
        status: "all",
        ...(isOwner && { ownerId }),
      })
      .then((response) => {
        if (cancelled) return
        setOwnerStations(
          response.stations.map((station) => ({
            id: station.id,
            name: station.name || "Wash Station",
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setOwnerStations([])
      })

    return () => {
      cancelled = true
    }
  }, [isAdmin, isOwner, ownerId])

  const ownerStationIds = useMemo(() => new Set(ownerStations.map((s) => s.id)), [ownerStations])

  const filteredBookings = useMemo(() => {
    if (isOwner && selectedStationId === "ALL") {
      return bookings.filter((booking) => ownerStationIds.has(booking.stationId))
    }
    return bookings
  }, [bookings, isOwner, selectedStationId, ownerStationIds])

  useEffect(() => {
    loadBookings({
      activeTab,
      stationId: selectedStationId,
      q: searchQuery,
      page,
      limit: LIMIT,
      userName: user?.name,
      userPhone: user?.phone,
      mine,
      startDate,
      endDate,
    })
  }, [
    loadBookings,
    activeTab,
    selectedStationId,
    searchQuery,
    page,
    user?.name,
    user?.phone,
    mine,
    startDate,
    endDate,
    refetch,
  ])

  useEffect(() => {
    if (isManager) {
      loadManagerStation()
    }
  }, [isManager, loadManagerStation])

  const updateParams = (params: Record<string, string | number | undefined>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === 1 || value === "ALL") {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      })

      return next
    })
  }

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return

    const success = await cancelBooking(selectedBookingForCancel.id, cancellationReason)

    if (success) {
      loadBookings({
        activeTab,
        stationId: selectedStationId,
        q: searchQuery,
        page,
        limit: LIMIT,
        userName: user?.name,
        userPhone: user?.phone,
        mine,
        startDate,
        endDate,
      })
    }
  }

  const handleRefresh = () => {
    updateParams({ refetch: Date.now() })
  }

  return {
    searchQuery,
    activeTab,
    selectedStationId,
    dateFilter,
    ownerStations,
    page,

    bookings,
    filteredBookings,
    pagination,
    isLoading,
    error,

    managedStation,
    isFetchingManagerStation,

    selectedBookingForQr,
    setSelectedBookingForQr,

    selectedBookingForCancel,
    setSelectedBookingForCancel,

    cancellationReason,
    setCancellationReason,

    isSubmittingCancel,

    updateParams,
    handleConfirmCancel,
    handleRefresh,
    cancelBooking,
  }
}
