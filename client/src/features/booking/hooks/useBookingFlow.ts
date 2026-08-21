import { useState, useEffect, useCallback } from "react"
import { useStationStore } from "@/features/station/store/station.store"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import { PAYMENT_METHOD } from "@/shared/constants/payment.constants"
import { useBookingVehicles } from "./useBookingVehicles"
import { useBookingServices } from "./useBookingServices"
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

  const vehicleState = useBookingVehicles({
    station: selectedStation,
    stationId,
  })

  const serviceState = useBookingServices({
    station: selectedStation,
    selectedVehicle: vehicleState.selectedVehicle,
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

  const canSubmit = Boolean(
    vehicleState.selectedVehicleId &&
    serviceState.selectedPlanId &&
    slotState.selectedSlotId
  )

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

    if (
      !canSubmit ||
      !stationId ||
      !slotState.selectedSlotId ||
      !vehicleState.selectedVehicleId ||
      !serviceState.selectedPlanId
    ) {
      return
    }

    setIsSubmittingBooking(true)
    try {
      const serviceType =
        serviceState.selectedPlanId === "FULL_WASH" || serviceState.selectedPlanId === "full"
          ? "FULL"
          : "HALF"

      const created = await bookingApi.createBooking({
        stationId,
        vehicleId: vehicleState.selectedVehicleId,
        timeWindowId: slotState.selectedSlotId,
        serviceType,
        extraServiceIds: serviceState.selectedExtraIds,
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
  }, [
    isAuthenticated,
    user,
    canSubmit,
    stationId,
    slotState.selectedSlotId,
    vehicleState.selectedVehicleId,
    serviceState.selectedPlanId,
    serviceState.selectedExtraIds,
  ])

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
    if (
      !stationId ||
      !vehicleState.selectedVehicle?.id ||
      !slotState.selectedSlotId ||
      !serviceState.selectedPlan
    ) {
      return
    }

    paymentState.initiatePayment({
      totalAmount: serviceState.totalPrice,
      serviceName: serviceState.selectedPlan.name,
      bookingIntentData: {
        stationId,
        vehicleId: vehicleState.selectedVehicle.id,
        timeWindowId: slotState.selectedSlotId,
        serviceType:
          serviceState.selectedPlan.id === "FULL_WASH" || serviceState.selectedPlan.id === "full"
            ? "FULL"
            : "HALF",
        extraServiceIds: serviceState.selectedExtras.map((e) => e.id),
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
    vehicleState.setIsAddVehicleModalOpen(true)
  }

  return {
    selectedStation,
    categories,
    classes,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalConfig,

    vehicles: vehicleState.vehicles,
    selectedVehicle: vehicleState.selectedVehicle,
    selectedVehicleId: vehicleState.selectedVehicleId,
    setSelectedVehicleId: vehicleState.setSelectedVehicleId,
    isStep1Loading: vehicleState.isStep1Loading,
    isAddVehicleModalOpen: vehicleState.isAddVehicleModalOpen,
    setIsAddVehicleModalOpen: vehicleState.setIsAddVehicleModalOpen,
    isAddingVehicle: vehicleState.isAddingVehicle,
    handleAddVehicleSubmit: vehicleState.handleAddVehicleSubmit,
    stationClassIds: vehicleState.stationClassIds,
    handleOpenAddVehicle,

    plans: serviceState.plans,
    selectedPlan: serviceState.selectedPlan,
    selectedPlanId: serviceState.selectedPlanId,
    setSelectedPlanId: serviceState.setSelectedPlanId,
    extraServices: serviceState.extraServices,
    selectedExtras: serviceState.selectedExtras,
    selectedExtraIds: serviceState.selectedExtraIds,
    toggleExtraService: serviceState.toggleExtraService,
    totalPrice: serviceState.totalPrice,

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
