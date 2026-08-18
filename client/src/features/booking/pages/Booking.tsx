import { useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import AddVehicleModal from "@/features/vehicle/components/AddVehicleModal"
import AuthRequiredModal from "@/shared/components/ui/AuthRequiredModal"
import VehicleSelectionStep from "../components/VehicleSelectionStep"
import ServiceSelectionStep from "../components/ServiceSelectionStep"
import TimeSlotSelectionStep from "../components/TimeSlotSelectionStep"
import BookingSummaryCard from "../components/BookingSummaryCard"
import BookingResultModal from "../components/BookingResultModal"
import PaymentModal from "../components/PaymentModal"
import { useBookingFlow } from "../hooks/useBookingFlow"

export default function Booking() {
  const [urlQuery] = useSearchParams()
  const navigate = useNavigate()
  const stationId = urlQuery.get("stationId")

  const {
    // Station & Auth
    selectedStation,
    categories,
    classes,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalConfig,

    // Step 1: Vehicles
    vehicles,
    selectedVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
    isStep1Loading,
    isAddVehicleModalOpen,
    setIsAddVehicleModalOpen,
    isAddingVehicle,
    handleAddVehicleSubmit,
    stationClassIds,
    handleOpenAddVehicle,

    // Step 2: Services
    plans,
    selectedPlan,
    selectedPlanId,
    setSelectedPlanId,
    extraServices,
    selectedExtras,
    selectedExtraIds,
    toggleExtraService,
    totalPrice,

    // Step 3: Slots
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
  } = useBookingFlow(stationId)

  return (
    <div className="pt-24 pb-20 min-h-screen text-left w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 text-foreground animate-in fade-in duration-300">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between py-4 mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Stations</span>
        </button>
      </div>

      {/* Main 12-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 8 Columns (Booking Steps Flow) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Step 1: Vehicle Selection */}
          <VehicleSelectionStep
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
            onAddVehicle={handleOpenAddVehicle}
            isLoading={isStep1Loading}
            categories={categories}
            classes={classes}
            stationClassIds={stationClassIds}
          />

          <div className="w-full h-px bg-border" />

          {/* Step 2: Service Type */}
          <ServiceSelectionStep
            plans={plans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={(id) => setSelectedPlanId(id)}
            extraServices={extraServices}
            selectedExtraIds={selectedExtraIds}
            onToggleExtra={toggleExtraService}
          />

          <div className="w-full h-px bg-border" />

          {/* Step 3: Time Window of Bookings */}
          <TimeSlotSelectionStep
            selectedDate={selectedDate}
            onDateChange={(d) => setSelectedDate(d)}
            slots={timeSlotOptions}
            selectedSlotId={selectedSlotId}
            onSelectSlot={(id) => setSelectedSlotId(id)}
            minDate={bookingCalendar?.minDate}
            maxDate={bookingCalendar?.maxDate}
            disabledDates={disabledDates}
            calendarDates={bookingCalendar?.dates}
            isLoadingSlots={isLoadingSlots}
          />
        </div>

        {/* Right Column: 4 Columns (Booking Summary Card) */}
        <div className="lg:col-span-4 w-full">
          <BookingSummaryCard
            station={selectedStation?.station || null}
            selectedVehicle={selectedVehicle}
            selectedPlan={selectedPlan}
            selectedExtras={selectedExtras}
            selectedDateFormatted={formattedDate}
            selectedTimeWindow={selectedSlot?.timeWindow || null}
            onProceed={handleProceedBooking}
            isSubmitting={isSubmittingBooking || paymentState.isProcessing}
            canSubmit={canSubmit}
          />
        </div>
      </div>

      {/* Payment Method Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amountInRupees={totalPrice}
        selectedMethod={paymentState.selectedMethod}
        onSelectMethod={paymentState.setSelectedMethod}
        useWalletWithUpi={paymentState.useWalletWithUpi}
        onToggleUseWalletWithUpi={paymentState.setUseWalletWithUpi}
        walletBalance={paymentState.walletBalance}
        isLoadingWallet={paymentState.isLoadingWallet}
        isProcessing={paymentState.isProcessing}
        onPaySecurely={handlePayFromModal}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSubmit={handleAddVehicleSubmit}
        isSubmitting={isAddingVehicle}
      />

      {/* Full-Screen Booking & Payment Result Modal (Success & Failure) */}
      <BookingResultModal
        isOpen={resultModalState.isOpen}
        type={resultModalState.type}
        bookingNumber={createdBooking?.bookingNumber || "WQ-20481"}
        bookingId={createdBooking?.id}
        stationName={selectedStation?.station?.name || "WashQueue Station"}
        vehicleName={
          selectedVehicle?.nickname ||
          (selectedVehicle?.brand
            ? `${selectedVehicle.brand} ${selectedVehicle.model || ""}`
            : undefined)
        }
        scheduledDate={formattedDate}
        scheduledTime={selectedSlot?.timeWindow}
        totalPrice={totalPrice}
        errorMessage={resultModalState.errorMessage}
        onClose={() => setResultModalState((prev) => ({ ...prev, isOpen: false }))}
        onRetryPayment={() => {
          setResultModalState({ isOpen: false, type: "error" })
          setIsPaymentModalOpen(true)
        }}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={authModalConfig.title}
        message={authModalConfig.message}
        actionName={authModalConfig.actionName}
      />
    </div>
  )
}
