import { useState } from "react"
import { X, Building, Clock, DollarSign, Sparkles } from "lucide-react"
import StationDetailsForm from "../station-forms/StationDetailsForm"
import AvailabilityForm from "../station-forms/AvailabilityForm"
import PricingConfigurationForm from "../station-forms/PricingConfigurationForm"
import ExtraServicesForm from "../station-forms/ExtraServicesForm"
import type { StationDetail, UpdateStationInput } from "../../types"

interface EditStationModalProps {
  stationDetail: StationDetail
  onClose: () => void
  onSaveStep: (stepNum: 1 | 2 | 3 | 4, input: UpdateStationInput) => Promise<void>
  isSubmitting?: boolean
}



export default function EditStationModal({
  stationDetail,
  onClose,
  onSaveStep,
  isSubmitting = false,
}: EditStationModalProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1)
  const { station, pricing, extraServices } = stationDetail

  const steps = [
    { id: 1, title: "Basic Info", icon: Building },
    { id: 2, title: "Availability", icon: Clock },
    { id: 3, title: "Wash Pricing", icon: DollarSign },
    { id: 4, title: "Amenities & Extras", icon: Sparkles },
  ] as const

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 sm:p-6 flex justify-center items-center overflow-y-auto">
      <div className="bg-[#0c1324] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#151b2d]">
          <div>
            <h2 className="text-xl font-extrabold text-white">Edit Station Configuration</h2>
            <p className="text-xs text-[#8c909f] mt-0.5">{station.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8c909f] hover:text-white rounded-xl bg-[#2e3447]/50 hover:bg-[#2e3447] transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-4 bg-[#191f31] border-b border-white/5 text-xs">
          {steps.map((st) => {
            const Icon = st.icon
            const isActive = activeStep === st.id
            return (
              <button
                key={st.id}
                onClick={() => setActiveStep(st.id)}
                className={`py-3.5 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-[#adc6ff] text-[#adc6ff] bg-[#adc6ff]/5"
                    : "border-transparent text-[#8c909f] hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{st.title}</span>
              </button>
            )
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeStep === 1 && (
            <StationDetailsForm
              initialValues={{
                name: station.name,
                phone: station.contact?.phone,
                email: station.contact?.email,
                description: station.description,
                street: station.address?.street,
                city: station.address?.city,
                pincode: station.address?.pincode,
                district: "",
                state: station.address?.state,
                country: station.address?.country || "India",
                latitude: station.location?.latitude || 0,
                longitude: station.location?.longitude || 0,
                existingImages: station.images || [],
              }}
              onCancel={onClose}
              onSubmit={async (data, newImageFiles, remainingExistingImages, deletedImagePublicIds) => {
                const formData = new FormData()
                formData.append("step", "1")
                formData.append("name", data.name)
                formData.append("description", data.description || "")
                formData.append("contact", JSON.stringify({ phone: data.phone, email: data.email }))
                formData.append("location", JSON.stringify({ latitude: data.latitude, longitude: data.longitude }))
                formData.append("address", JSON.stringify({
                  street: data.street,
                  city: data.city,
                  state: data.state,
                  country: data.country,
                  pincode: data.pincode,
                }))
                formData.append("images", JSON.stringify(remainingExistingImages))

                if (deletedImagePublicIds.length > 0) {
                  formData.append("deletedImagePublicIds", JSON.stringify(deletedImagePublicIds))
                }

                newImageFiles.forEach((file) => {
                  formData.append("images", file)
                })

                await onSaveStep(1, formData as unknown as UpdateStationInput)
                setActiveStep(2)
              }}
              isLoading={isSubmitting}
            />
          )}

          {activeStep === 2 && (
            <AvailabilityForm
              initialValues={{
                operatingHours: station.operatingHours || [],
                holidays: station.holidays || [],
                ...(station.slotConfig || {
                  bays: 1,
                  windowDurationMins: 30,
                  capacityPerWindow: 1,
                  walkInReservedSlots: 0,
                  maxAdvanceBookingDays: 7,
                  bufferBetweenWindowsMins: 5,
                  allowWalkIns: true,
                }),
              }}
              onBack={() => setActiveStep(1)}
              onSubmit={async (data) => {
                const { operatingHours, holidays, ...slotConfig } = data
                await onSaveStep(2, {
                  step: 2,
                  operatingHours: operatingHours || [],
                  holidays: holidays || [],
                  slotConfig,
                })
                setActiveStep(3)
              }}
              isLoading={isSubmitting}
            />
          )}

          {activeStep === 3 && (
            <PricingConfigurationForm
              initialValues={pricing}
              onBack={() => setActiveStep(2)}
              onSubmit={async (data) => {
                await onSaveStep(3, { step: 3, pricing: data })
                setActiveStep(4)
              }}
              isLoading={isSubmitting}
            />
          )}

          {activeStep === 4 && (
            <ExtraServicesForm
              initialValues={{
                amenities: station.amenities || [],
                extraServices: extraServices.map((es) => ({
                  id: es.id,
                  name: es.name,
                  description: es.description || "",
                  pricing: es.pricing || [],
                  isActive: es.isActive ?? true,
                })),
              }}
              pricing={pricing}
              onBack={() => setActiveStep(3)}
              onSubmit={async (data) => {
                await onSaveStep(4, { step: 4, ...data })
                onClose()
              }}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}
