import { useState, useEffect, useCallback } from "react"
import { useStationStore } from "@/features/station/store/station.store"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import { useBookingVehicles } from "./useBookingVehicles"
import { useBookingServices } from "./useBookingServices"
import { useBookingSlots } from "./useBookingSlots"
import { useBookingPayment } from "./useBookingPayment"

export function useBookingFlow(stationId: string | null) {
  const { isAuthenticated, user } = useAuthStore()
  const { fetchStationById, selectedStation } = useStationStore()
  const { categories, classes, loadData: loadCatalogData } = useVehicleCatelogStore()

  // --- Auth Modal State ---
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

  // Prompt unauthenticated users upon landing
  useEffect(() => {
    if (!isAuthenticated || !user) {
      queueMicrotask(() => setIsAuthModalOpen(true))
    }
  }, [isAuthenticated, user])

  // --- Fetch Station on ID change ---
  useEffect(() => {
    if (stationId) {
      fetchStationById(stationId)
    }
  }, [stationId, fetchStationById])

  // --- Fetch Catalog Data on mount ---
  useEffect(() => {
    if (categories.length === 0 || classes.length === 0) {
      loadCatalogData()
    }
  }, [categories.length, classes.length, loadCatalogData])

  // --- Sub-Hooks ---
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

  // --- Payment Modal & Hook State ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const paymentState = useBookingPayment(isPaymentModalOpen)

  // --- Booking Submission & Result State ---
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

  // Online Payment Success Handler (Reservation already verified and confirmed into Booking by backend)
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

  // Pay at Station / Cash Booking Submission
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
        paymentType: "PAY_AT_STATION",
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

  // Handle CTA Click from Summary Card
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

  // Handle Secure Payment Execution from PaymentModal
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
        paymentType: "ONLINE_FULL",
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
    // Station & Auth
    selectedStation,
    categories,
    classes,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalConfig,

    // Step 1: Vehicles
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

    // Step 2: Services
    plans: serviceState.plans,
    selectedPlan: serviceState.selectedPlan,
    selectedPlanId: serviceState.selectedPlanId,
    setSelectedPlanId: serviceState.setSelectedPlanId,
    extraServices: serviceState.extraServices,
    selectedExtras: serviceState.selectedExtras,
    selectedExtraIds: serviceState.selectedExtraIds,
    toggleExtraService: serviceState.toggleExtraService,
    totalPrice: serviceState.totalPrice,

    // Step 3: Slots
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

    // Submission & Summary
    canSubmit,
    isSubmittingBooking,
    createdBooking,
    resultModalState,
    setResultModalState,

    // Payment Modal & Handlers
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentState,
    handleProceedBooking,
    handlePayFromModal,
  }
}
