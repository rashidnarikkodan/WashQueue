import { useState, useEffect } from "react"
import { Sparkles, Plus, Trash2, ArrowRight, Check, Car, Bike, Truck, Tag } from "lucide-react"
import { toast } from "sonner"
import FormInput from "@/shared/components/form/FormInput"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/vehicleCatelogStore"
import type { ExtraServiceInput } from "../../types"

const PRESET_AMENITIES = [
  "Free WiFi",
  "Parking",
  "Waiting Lounge",
  "Restroom",
  "Cafe",
  "EV Charging",
  "Pickup & Drop",
  "Loyalty Program",
]

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface ExtraServicesFormProps {
  initialValues?: {
    amenities?: string[]
    extraServices?: ExtraServiceInput[]
  }
  onSubmit: (data: { amenities: string[]; extraServices: ExtraServiceInput[] }) => void
  onBack: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function ExtraServicesForm({
  initialValues,
  onSubmit,
  onBack,
  onCancel,
  isLoading = false,
}: ExtraServicesFormProps) {
  const { categories, classes, loadData } = useVehicleCatelogStore()
  const [amenities, setAmenities] = useState<string[]>(
    initialValues?.amenities || ["Free WiFi", "Parking", "Waiting Lounge"]
  )
  const [customAmenity, setCustomAmenity] = useState("")

  const [extraServices, setExtraServices] = useState<ExtraServiceInput[]>(
    initialValues?.extraServices && initialValues.extraServices.length > 0
      ? initialValues.extraServices.map((s) => ({
          ...s,
          slug: s.slug || slugify(s.name),
        }))
      : [
          {
            name: "Underbody Wash",
            slug: "underbody-wash",
            description: "Deep cleaning of the vehicle chassis",
            pricing: [],
            isActive: true,
          },
        ]
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("two") || lower.includes("bike") || lower.includes("motorcycle")) return <Bike size={16} />
    if (lower.includes("lorry") || lower.includes("truck") || lower.includes("bus")) return <Truck size={16} />
    return <Car size={16} />
  }

  const toggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      setAmenities((prev) => prev.filter((a) => a !== name))
    } else {
      setAmenities((prev) => [...prev, name])
    }
  }

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim()
    if (!trimmed) return
    if (!amenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed])
    }
    setCustomAmenity("")
  }

  const handleAddService = () => {
    const newService: ExtraServiceInput = {
      name: "",
      slug: "",
      description: "",
      pricing: classes.map((c) => ({ vehicleClassId: c.id, price: 99 })),
      isActive: true,
    }
    setExtraServices((prev) => [...prev, newService])
  }

  const handleRemoveService = (index: number) => {
    setExtraServices((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isDeleted: true } : s))
    )
  }

  const handleServiceChange = (
    index: number,
    field: "name" | "slug" | "description",
    value: string
  ) => {
    setExtraServices((prev) => {
      const next = [...prev]
      const current = { ...next[index] }

      if (field === "name") {
        current.name = value
        // Auto update slug when name changes unless manually overridden
        current.slug = slugify(value)
      } else if (field === "slug") {
        current.slug = slugify(value)
      } else if (field === "description") {
        current.description = value
      }

      next[index] = current
      return next
    })
  }

  const handleServicePriceChange = (serviceIndex: number, classId: string, price: number) => {
    setExtraServices((prev) => {
      const next = [...prev]
      const service = { ...next[serviceIndex] }
      const pricingList = [...(service.pricing || [])]

      const idx = pricingList.findIndex((p) => p.vehicleClassId === classId)
      if (idx >= 0) {
        pricingList[idx] = { ...pricingList[idx], price: price < 0 ? 0 : price }
      } else {
        pricingList.push({ vehicleClassId: classId, price: price < 0 ? 0 : price })
      }

      service.pricing = pricingList
      next[serviceIndex] = service
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const activeServices = extraServices.filter((s) => !s.isDeleted)

    // Validate duplicate names & slugs
    const seenNames = new Map<string, number>()
    const seenSlugs = new Map<string, number>()

    for (let i = 0; i < activeServices.length; i++) {
      const s = activeServices[i]
      const nameKey = s.name.trim().toLowerCase()
      const slugKey = s.slug ? s.slug.trim().toLowerCase() : slugify(s.name)

      if (!nameKey) {
        toast.error(`Service #${i + 1} requires a service name`)
        return
      }

      if (seenNames.has(nameKey)) {
        toast.error(`Duplicate service name "${s.name}" found. Each extra service must have a unique name.`)
        return
      }

      if (seenSlugs.has(slugKey)) {
        toast.error(`Duplicate service slug "${slugKey}" found for "${s.name}". Service names or slugs cannot repeat.`)
        return
      }

      seenNames.set(nameKey, i)
      seenSlugs.set(slugKey, i)
    }

    // Assign final computed slugs
    const processedServices = extraServices.map((s) => ({
      ...s,
      slug: s.slug || slugify(s.name),
    }))

    onSubmit({
      amenities,
      extraServices: processedServices,
    })
  }

  const activeExtraServices = extraServices.filter((s) => !s.isDeleted)

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <span className="text-[12px] font-bold tracking-[2.4px] text-[#ADC6FF] uppercase">
          STEP 4 OF 5
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DCE1FB] tracking-tight">
          Extra Services & Amenities
        </h1>
        <p className="text-sm sm:text-base text-[#C2C6D6] opacity-80 font-normal">
          Add details of extra services and amenities at your station.
        </p>
      </div>

      {/* Section 1: Extra Services */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
          <Sparkles size={16} className="text-[#ADC6FF]" />
          <span>EXTRA SERVICES</span>
        </div>

        <div className="space-y-4">
          {activeExtraServices.map((service, index) => {
            const computedSlug = service.slug || slugify(service.name)

            return (
              <div
                key={index}
                className="p-6 rounded-2xl border border-slate-800/80 bg-[#070D1F] space-y-4 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
                  title="Remove service"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormInput
                    label="SERVICE NAME"
                    type="text"
                    placeholder="e.g. Underbody Wash"
                    value={service.name}
                    onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                  />

                  {/* Slug Input / Preview */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-wider text-[#C2C6D6] uppercase flex items-center gap-1.5">
                      <Tag size={12} className="text-[#ADC6FF]" />
                      <span>SLUG (UNIQUE IDENTIFIER)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="underbody-wash"
                      value={computedSlug}
                      onChange={(e) => handleServiceChange(index, "slug", e.target.value)}
                      className="w-full bg-[#141A2D] text-slate-300 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <FormInput
                    label="DESCRIPTION"
                    type="text"
                    placeholder="Deep cleaning of the vehicle chassis"
                    value={service.description || ""}
                    onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                  />
                </div>

                {/* Price per vehicle category & class */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold tracking-wider text-[#C2C6D6] uppercase block">
                    PRICING PER VEHICLE CATEGORY & CLASS (₹)
                  </span>

                  <div className="space-y-3">
                    {categories.map((category) => {
                      const categoryClasses = classes.filter((cls) => cls.categoryId === category.id)
                      if (categoryClasses.length === 0) return null

                      return (
                        <div
                          key={category.id}
                          className="p-4 rounded-xl border border-slate-800/80 bg-[#141A2D] space-y-3"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-[#ADC6FF] tracking-wider uppercase border-b border-slate-800/60 pb-2">
                            {getCategoryIcon(category.name)}
                            <span>{category.name}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {categoryClasses.map((cls) => {
                              const priceItem = (service.pricing || []).find((p) => p.vehicleClassId === cls.id)
                              return (
                                <div key={cls.id} className="flex flex-col gap-1">
                                  <label className="text-[10px] font-semibold text-slate-400 truncate">
                                    {cls.name}
                                  </label>
                                  <div className="flex items-center rounded-lg border border-slate-800 bg-[#2E3447] px-2.5 py-1.5 focus-within:border-blue-500/60 transition-colors">
                                    <span className="text-xs text-slate-400 mr-1">₹</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={priceItem?.price ?? 99}
                                      onChange={(e) =>
                                        handleServicePriceChange(index, cls.id, parseFloat(e.target.value) || 0)
                                      }
                                      className="w-full bg-transparent text-xs font-bold text-white outline-none"
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}

                    {/* Fallback for unclassified vehicle classes */}
                    {(() => {
                      const unclassified = classes.filter(
                        (cls) => !cls.categoryId || !categories.some((cat) => cat.id === cls.categoryId)
                      )
                      if (unclassified.length === 0) return null
                      return (
                        <div className="p-4 rounded-xl border border-slate-800/80 bg-[#141A2D] space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#ADC6FF] tracking-wider uppercase border-b border-slate-800/60 pb-2">
                            <Car size={16} />
                            <span>Other Vehicles</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {unclassified.map((cls) => {
                              const priceItem = (service.pricing || []).find((p) => p.vehicleClassId === cls.id)
                              return (
                                <div key={cls.id} className="flex flex-col gap-1">
                                  <label className="text-[10px] font-semibold text-slate-400 truncate">
                                    {cls.name}
                                  </label>
                                  <div className="flex items-center rounded-lg border border-slate-800 bg-[#2E3447] px-2.5 py-1.5 focus-within:border-blue-500/60 transition-colors">
                                    <span className="text-xs text-slate-400 mr-1">₹</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={priceItem?.price ?? 99}
                                      onChange={(e) =>
                                        handleServicePriceChange(index, cls.id, parseFloat(e.target.value) || 0)
                                      }
                                      className="w-full bg-transparent text-xs font-bold text-white outline-none"
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={handleAddService}
            className="w-full py-4 border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/10 hover:bg-slate-900/30 rounded-2xl flex items-center justify-center gap-2 text-slate-300 font-semibold text-sm transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Another Service</span>
          </button>
        </div>
      </div>

      {/* Section 2: Amenities */}
      <div className="space-y-4 p-6 sm:p-8 rounded-2xl border border-slate-800/80 bg-[#191F31]">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Amenities</h3>
          <p className="text-xs text-[#C2C6D6]">
            Help customers choose you by listing on-site facilities.
          </p>
        </div>

        {/* Amenity Chips */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          {PRESET_AMENITIES.map((name) => {
            const isSelected = amenities.includes(name)
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleAmenity(name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#004395]/40 border-[#ADC6FF] text-white shadow-md"
                    : "bg-[#23293C]/50 border-slate-800/80 text-[#C2C6D6] hover:bg-slate-800/50"
                }`}
              >
                {isSelected && <Check size={14} className="text-[#ADC6FF]" />}
                <span>{name}</span>
              </button>
            )
          })}
        </div>

        {/* Custom Amenity Input */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add custom amenity..."
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            className="bg-[#2E3447] text-[#FFFFFF] text-xs px-3.5 py-2 rounded-xl border border-slate-700 outline-none flex-1 placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleAddCustomAmenity}
            className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-700"
          >
            Add
          </button>
        </div>
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
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#ADC6FF] text-[#002E6A] hover:bg-blue-300 disabled:opacity-50 text-sm font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{isLoading ? "Saving..." : "Save & Continue"}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}
