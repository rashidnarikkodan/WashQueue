import { useState, useEffect, useCallback, useMemo } from "react"
import { useStationStore } from "@/features/station/store/station.store"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import { PAYMENT_METHOD } from "@/shared/constants/payment.constants"
import { useBookingSelection } from "./useBookingSelection"
import { useBookingSlots } from "./useBookingSlots"
import { useBookingPayment } from "./useBookingPayment"

export function useBookingFlow(stationId: string | null) {
  const { isAuthenticated, user } = useAuthStore()
  const { fetchStationById, selectedStation } = useStationStore()
  const { categories, classes, loadData: loadCatalogData } = useVehicleCatelogStore()

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalConfig, setAuthModalConfig] = useState<{
    title?: string
    message?: string
    actionName?: string
  }>({
    title: "Sign in to Book a Wash",
    message: "You must be logged in to reserve wash slots and select your vehicles.",
    actionName: "book a wash",
  })

  useEffect(() => {
    if (!isAuthenticated || !user) {
      queueMicrotask(() => setIsAuthModalOpen(true))
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (stationId) {
      fetchStationById(stationId)
    }
  }, [stationId, fetchStationById])

  useEffect(() => {
    if (categories.length === 0 || classes.length === 0) {
      loadCatalogData()
    }
  }, [categories.length, classes.length, loadCatalogData])

  const selectionState = useBookingSelection({
    station: selectedStation,
    stationId,
  })

  const slotState = useBookingSlots({
    stationId,
  })

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const paymentState = useBookingPayment(isPaymentModalOpen)

  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(null)
  const [resultModalState, setResultModalState] = useState<{
    isOpen: boolean
    type: "success" | "error"
    errorMessage?: string
  }>({
    isOpen: false,
    type: "success",
  })

  const bookingIntent = useMemo(() => {
    if (
      !stationId ||
      !selectionState.selectedVehicle ||
      !selectionState.selectedPlan ||
      !slotState.selectedSlotId
    ) {
      return null
    }

    const serviceType =
      selectionState.selectedPlan.id === "FULL_WASH" || selectionState.selectedPlan.id === "full"
        ? ("FULL" as const)
        : ("HALF" as const)

    return {
      stationId,
      vehicleId: selectionState.selectedVehicle.id,
      timeWindowId: slotState.selectedSlotId,
      serviceType,
      serviceName: selectionState.selectedPlan.name,
      totalAmount: selectionState.totalPrice,
      extraServiceIds: selectionState.selectedExtras.map((e) => e.id),
    }
  }, [
    stationId,
    selectionState.selectedVehicle,
    selectionState.selectedPlan,
    selectionState.totalPrice,
    selectionState.selectedExtras,
    slotState.selectedSlotId,
  ])

  const canSubmit = bookingIntent !== null


  //to handle successfully completed online payment and open success/error modal
  const handleOnlinePaymentSuccess = useCallback((booking?: BookingResponse) => {
    setIsPaymentModalOpen(false)
    if (booking) {
      setCreatedBooking(booking)
      setResultModalState({ isOpen: true, type: "success" })
    } else {
      setResultModalState({
        isOpen: true,
        type: "error",
        errorMessage: "Payment succeeded but booking details could not be retrieved.",
      })
    }
  }, [])

  const handleCashBooking = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setAuthModalConfig({
        title: "Sign in to Book a Wash",
        message: "You must be logged in to complete booking reservations.",
        actionName: "book a wash",
      })
      setIsAuthModalOpen(true)
      return
    }

    if (!bookingIntent) {
      return
    }

    setIsSubmittingBooking(true)
    try {
      const created = await bookingApi.createBooking({
        stationId: bookingIntent.stationId,
        vehicleId: bookingIntent.vehicleId,
        timeWindowId: bookingIntent.timeWindowId,
        serviceType: bookingIntent.serviceType,
        extraServiceIds: bookingIntent.extraServiceIds,
        paymentMethod: PAYMENT_METHOD.PAY_AT_STATION,
      })

      setCreatedBooking(created)
      setResultModalState({ isOpen: true, type: "success" })
    } catch (err: unknown) {
      const errorObj = err as Error
      console.error("Cash booking submission error:", err)
      setResultModalState({
        isOpen: true,
        type: "error",
        errorMessage: errorObj?.message || "Failed to finalize booking reservation.",
      })
    } finally {
      setIsSubmittingBooking(false)
    }
  }, [isAuthenticated, user, bookingIntent])

  const handleProceedBooking = (method: "ONLINE" | "CASH") => {
    if (!isAuthenticated || !user) {
      setAuthModalConfig({
        title: "Sign in to Book a Wash",
        message: "You must be logged in to reserve wash slots.",
        actionName: "book a wash",
      })
      setIsAuthModalOpen(true)
      return
    }

    if (method === "ONLINE") {
      setIsPaymentModalOpen(true)
    } else {
      void handleCashBooking()
    }
  }

  const handlePayFromModal = () => {
    if (!bookingIntent) {
      return
    }

    paymentState.initiatePayment({
      totalAmount: bookingIntent.totalAmount,
      serviceName: bookingIntent.serviceName,
      bookingIntentData: {
        stationId: bookingIntent.stationId,
        vehicleId: bookingIntent.vehicleId,
        timeWindowId: bookingIntent.timeWindowId,
        serviceType: bookingIntent.serviceType,
        extraServiceIds: bookingIntent.extraServiceIds,
        paymentMethod: PAYMENT_METHOD.ONLINE,
      },
      onSuccess: (paymentData) => {
        handleOnlinePaymentSuccess(paymentData.booking)
      },
      onError: (errMsg) => {
        setIsPaymentModalOpen(false)
        setResultModalState({
          isOpen: true,
          type: "error",
          errorMessage: errMsg || "Payment was cancelled or could not be verified.",
        })
      },
      onCancel: () => {
        setIsPaymentModalOpen(false)
      },
    })
  }

  const handleOpenAddVehicle = () => {
    if (!isAuthenticated || !user) {
      setAuthModalConfig({
        title: "Sign in to Register Vehicle",
        message: "You must be logged in to add vehicles to your digital garage for booking.",
        actionName: "add a vehicle",
      })
      setIsAuthModalOpen(true)
      return
    }
    selectionState.setIsAddVehicleModalOpen(true)
  }

  return {
    selectedStation,
    categories,
    classes,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalConfig,

    vehicles: selectionState.vehicles,
    selectedVehicle: selectionState.selectedVehicle,
    selectedVehicleId: selectionState.selectedVehicleId,
    setSelectedVehicleId: selectionState.setSelectedVehicleId,
    isStep1Loading: selectionState.isStep1Loading,
    isAddVehicleModalOpen: selectionState.isAddVehicleModalOpen,
    setIsAddVehicleModalOpen: selectionState.setIsAddVehicleModalOpen,
    isAddingVehicle: selectionState.isAddingVehicle,
    handleAddVehicleSubmit: selectionState.handleAddVehicleSubmit,
    stationClassIds: selectionState.stationClassIds,
    handleOpenAddVehicle,

    plans: selectionState.plans,
    selectedPlan: selectionState.selectedPlan,
    selectedPlanId: selectionState.selectedPlanId,
    setSelectedPlanId: selectionState.setSelectedPlanId,
    extraServices: selectionState.extraServices,
    selectedExtras: selectionState.selectedExtras,
    selectedExtraIds: selectionState.selectedExtraIds,
    toggleExtraService: selectionState.toggleExtraService,
    totalPrice: selectionState.totalPrice,

    selectedDate: slotState.selectedDate,
    setSelectedDate: slotState.setSelectedDate,
    selectedSlotId: slotState.selectedSlotId,
    setSelectedSlotId: slotState.setSelectedSlotId,
    selectedSlot: slotState.selectedSlot,
    bookingCalendar: slotState.bookingCalendar,
    disabledDates: slotState.disabledDates,
    timeSlotOptions: slotState.timeSlotOptions,
    formattedDate: slotState.formattedDate,
    isLoadingSlots: slotState.isLoadingSlots,

    canSubmit,
    isSubmittingBooking,
    createdBooking,
    resultModalState,
    setResultModalState,

    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentState,
    handleProceedBooking,
    handlePayFromModal,
  }
}
