import { Info, Clock, DollarSign, Sparkles, CheckCircle2, AlertCircle, Edit2 } from "lucide-react"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import type { StationDetailsFormData, AvailabilityFormData } from "../../schemas/station.schema"
import type { PricingItem } from "./PricingConfigurationForm"
import type { ExtraServiceInput, StationImage } from "../../types"

interface ReviewSubmitProps {
  stationDetails?: Partial<StationDetailsFormData>
  imageFiles?: File[]
  existingImages?: StationImage[]
  availability?: Partial<AvailabilityFormData> & { holidays?: { date: string; reason?: string }[] }
  pricing?: PricingItem[]
  extraServicesData?: {
    amenities?: string[]
    extraServices?: ExtraServiceInput[]
  }
  isEditMode?: boolean
  onEditStep: (step: number) => void
  onBack: () => void
  onCancel?: () => void
  onSubmit: () => void
  isLoading?: boolean
  error?: string | null
}

export default function ReviewSubmit({
  stationDetails,
  imageFiles = [],
  existingImages = [],
  availability,
  pricing = [],
  extraServicesData,
  isEditMode = false,
  onEditStep,
  onBack,
  onCancel,
  onSubmit,
  isLoading = false,
  error,
}: ReviewSubmitProps) {
  const { classes } = useVehicleCatelogStore()

  const activeExtraServices = (extraServicesData?.extraServices || []).filter((s) => !s.isDeleted)
  const totalPhotosCount = existingImages.length + imageFiles.length

  return (
    <div className="space-y-8 text-left">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <span className="text-[12px] font-bold tracking-[2.4px] text-[#ADC6FF] uppercase">
          STEP 5 OF 5
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DCE1FB] tracking-tight">
          {isEditMode ? "Review & Save Updates" : "Review & Submit"}
        </h1>
        <p className="text-sm sm:text-base text-[#C2C6D6] opacity-80 font-normal">
          {isEditMode
            ? "Review all information before saving updates to your station."
            : "Review all information before submitting your station for approval."}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Station Details & Media */}
      <div className="p-6 rounded-2xl border border-slate-800/80 bg-[#151B2D] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#ADC6FF] uppercase">
            <Info size={16} />
            <span>STATION DETAILS & ADDRESS</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="flex items-center gap-1 text-xs font-bold text-[#ADC6FF] hover:underline cursor-pointer"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              STATION NAME
            </span>
            <span className="text-white text-sm font-bold">{stationDetails?.name || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              CONTACT
            </span>
            <span className="text-white font-medium">
              {stationDetails?.phone} | {stationDetails?.email}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="block text-slate-400 font-semibold uppercase tracking-wider">
              DESCRIPTION
            </span>

            <p className="mt-1 text-slate-300 font-normal break-words whitespace-pre-wrap">
              {stationDetails?.description || "No description provided."}
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              ADDRESS
            </span>
            <span className="text-slate-300 font-medium">
              {stationDetails?.street}, {stationDetails?.city},{" "}
              {stationDetails?.district ? `${stationDetails.district}, ` : ""}
              {stationDetails?.state}, {stationDetails?.country} - {stationDetails?.pincode}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              LOCATION GPS
            </span>
            <span className="text-[#ADC6FF] font-mono font-bold">
              {stationDetails?.latitude}° N, {stationDetails?.longitude}° W
            </span>
          </div>
        </div>

        {/* Media preview */}
        {totalPhotosCount > 0 && (
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              PHOTOS ({totalPhotosCount})
            </span>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img, idx) => (
                <div key={`existing-${idx}`} className="relative group">
                  <img
                    src={img.url}
                    alt={`Saved Station Photo ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-emerald-500/40"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-bold text-emerald-300 text-center py-0.5 rounded-b-lg">
                    Saved
                  </span>
                </div>
              ))}
              {imageFiles.map((file, idx) => (
                <div key={`new-${idx}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New Station Photo ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-800"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-bold text-blue-300 text-center py-0.5 rounded-b-lg">
                    New
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Availability */}
      <div className="p-6 rounded-2xl border border-slate-800/80 bg-[#151B2D] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#ADC6FF] uppercase">
            <Clock size={16} />
            <span>AVAILABILITY & SLOTS</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="flex items-center gap-1 text-xs font-bold text-[#ADC6FF] hover:underline cursor-pointer"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              BAYS
            </span>
            <span className="text-white text-sm font-bold">{availability?.bays ?? 1}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              DURATION
            </span>
            <span className="text-white text-sm font-bold">
              {availability?.windowDurationMins ?? 30} mins
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              CAPACITY / WINDOW
            </span>
            <span className="text-white text-sm font-bold">
              {availability?.capacityPerWindow ?? 1}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              WALK-IN SLOTS
            </span>
            <span className="text-white text-sm font-bold">
              {availability?.walkInReservedSlots ?? 0}
            </span>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            OPERATING DAYS
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {availability?.operatingHours?.map((oh) => (
              <div
                key={oh.day}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">{oh.day}</span>
                  <span
                    className={
                      oh.isClosed ? "text-red-400 font-bold" : "text-emerald-400 font-mono"
                    }
                  >
                    {oh.isClosed ? "Closed" : `${oh.open} - ${oh.close}`}
                  </span>
                </div>
                {!oh.isClosed && oh.breaks && oh.breaks.length > 0 && (
                  <div className="text-[10px] text-amber-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-1 mt-1">
                    <span>Break:</span>
                    <span>{oh.breaks.map((b) => `${b.start}-${b.end}`).join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Pricing */}
      <div className="p-6 rounded-2xl border border-slate-800/80 bg-[#151B2D] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#ADC6FF] uppercase">
            <DollarSign size={16} />
            <span>PRICING CONFIGURATION</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="flex items-center gap-1 text-xs font-bold text-[#ADC6FF] hover:underline cursor-pointer"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>
        </div>

        <div className="space-y-2">
          {pricing.map((item) => {
            const cls = classes.find((c) => c.id === item.vehicleClassId)
            return (
              item.isActive && (
                <div
                  key={item.vehicleClassId}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
                >
                  <span className="font-semibold text-white">{cls?.name || "Vehicle Class"}</span>
                  {item.isActive ? (
                    <div className="flex items-center gap-4 text-slate-300">
                      <span>
                        Half Wash: <strong className="text-white">₹{item.halfWashPrice}</strong>
                      </span>
                      <span>
                        Full Wash: <strong className="text-white">₹{item.fullWashPrice}</strong>
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">Not Offered</span>
                  )}
                </div>
              )
            )
          })}
        </div>
      </div>

      {/* Section 4: Extra Services & Amenities */}
      <div className="p-6 rounded-2xl border border-slate-800/80 bg-[#151B2D] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#ADC6FF] uppercase">
            <Sparkles size={16} />
            <span>EXTRA SERVICES & AMENITIES</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="flex items-center gap-1 text-xs font-bold text-[#ADC6FF] hover:underline cursor-pointer"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            AMENITIES
          </span>
          <div className="flex flex-wrap gap-2">
            {(extraServicesData?.amenities || []).map((amenity, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {activeExtraServices.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              EXTRA SERVICES
            </span>
            <div className="space-y-2">
              {activeExtraServices.map((service, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs space-y-1.5"
                >
                  <div className="font-bold text-white">{service.name}</div>
                  {service.description && (
                    <div className="text-slate-400 text-[11px]">{service.description}</div>
                  )}
                  {service.pricing && service.pricing.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {service.pricing.map((p) => {
                        const cls = classes.find((c) => c.id === p.vehicleClassId)
                        if (!cls) return null
                        return (
                          <span
                            key={p.vehicleClassId}
                            className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-[10px] text-slate-300"
                          >
                            {cls.name}: <strong className="text-white">₹{p.price}</strong>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center border-t border-slate-800/80 pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-bold transition-all cursor-pointer"
          >
            Back
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#ADC6FF] text-[#002E6A] hover:bg-blue-300 disabled:opacity-50 text-sm font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <CheckCircle2 size={16} />
          <span>
            {isLoading
              ? isEditMode
                ? "Saving Changes..."
                : "Submitting..."
              : isEditMode
                ? "Save Station Updates"
                : "Submit Station"}
          </span>
        </button>
      </div>
    </div>
  )
}
