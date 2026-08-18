import { useState, useEffect, useMemo } from "react"
import { stationApi } from "@/shared/apis/station.api"
import type { Calender, Window } from "../types/booking.types"
import type { TimeSlotOption } from "../components/TimeSlotSelectionStep"

interface UseBookingSlotsParams {
  stationId: string | null
}

export function useBookingSlots({ stationId }: UseBookingSlotsParams) {
  const todayIso = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState<string>(todayIso)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const [bookingCalendar, setBookingCalendar] = useState<Calender | null>(null)
  const [serverWindows, setServerWindows] = useState<Window[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Fetch Booking Calendar from server
  useEffect(() => {
    if (!stationId) return
    stationApi
      .getBookingCalendar(stationId)
      .then((data) => {
        setBookingCalendar(data)
        if (data.dates.length > 0) {
          setSelectedDate((prevDate) => {
            const currentValid = data.dates.find(
              (d) => d.date === prevDate && d.status === "AVAILABLE"
            )

            // If currently selected date is not valid, pick the first available date
            if (!currentValid) {
              const firstAvailable = data.dates.find((d) => d.status === "AVAILABLE")
              return firstAvailable ? firstAvailable.date : prevDate
            }
            return prevDate
          })
        }
      })
      .catch(() => {})
  }, [stationId])

  // Fetch Available Time Windows for selectedDate
  useEffect(() => {
    if (!stationId || !selectedDate) return

    const fetchWindows = async () => {
      setIsLoadingSlots(true)
      try {
        const data = await stationApi.getAvailableTimeWindows(stationId, selectedDate)
        const windowsList = data.windows || []
        setServerWindows(windowsList)
        const available = windowsList.filter((w) => w.status === "OPEN" && w.remainingCapacity > 0)
        if (available.length > 0) {
          setSelectedSlotId((prev) => {
            const exists = available.some((w) => w.windowId === prev)
            return exists ? prev : available[0].windowId
          })
        } else {
          setSelectedSlotId(null)
        }
      } catch {
        setServerWindows([])
        setSelectedSlotId(null)
      } finally {
        setIsLoadingSlots(false)
      }
    }

    void fetchWindows()
  }, [stationId, selectedDate])

  // Compute disabled dates array (dates that are NOT available)
  const disabledDates = useMemo(() => {
    if (!bookingCalendar?.dates) return []
    return bookingCalendar.dates.filter((d) => d.status !== "AVAILABLE").map((d) => d.date)
  }, [bookingCalendar])

  // Transform server windows into TimeSlotOption items
  const timeSlotOptions: TimeSlotOption[] = useMemo(() => {
    if (serverWindows.length > 0) {
      const now = new Date()
      return serverWindows.map((w) => {
        const startDateObj = new Date(w.start)
        const endDateObj = new Date(w.end)
        const formatTime = (d: Date) =>
          d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        const timeWindow = `${formatTime(startDateObj)} - ${formatTime(endDateObj)}`

        const isPast = w.status === "PAST" || endDateObj.getTime() <= now.getTime()

        let label = `${w.remainingCapacity} slots left`
        let status: "AVAILABLE" | "SELECTED" | "LIMITED" | "FULL" | "PAST" = "AVAILABLE"

        if (isPast) {
          status = "PAST"
          label = "Time Elapsed"
        } else if (w.status === "FULL" || w.remainingCapacity <= 0) {
          status = "FULL"
          label = "Fully Booked"
        } else if (w.remainingCapacity <= 2) {
          status = "LIMITED"
          label = `Only ${w.remainingCapacity} slot${w.remainingCapacity === 1 ? "" : "s"} left`
        }

        return {
          id: w.windowId,
          timeWindow,
          label,
          status,
          slotsLeft: w.remainingCapacity,
        }
      })
    }
    return []
  }, [serverWindows])

  const selectedSlot = useMemo(
    () => timeSlotOptions.find((s) => s.id === selectedSlotId) || null,
    [timeSlotOptions, selectedSlotId]
  )

  const formattedDate = useMemo(() => {
    if (!selectedDate) return ""
    const d = new Date(selectedDate)
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }, [selectedDate])

  return {
    selectedDate,
    setSelectedDate,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    bookingCalendar,
    disabledDates,
    timeSlotOptions,
    formattedDate,
    isLoadingSlots,
  }
}
