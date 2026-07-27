import { useState, useEffect, useMemo } from "react"
import { Sparkles, Plus, Trash2, ArrowRight, Check, Car, Bike, Truck, Wrench, X } from "lucide-react"
import { toast } from "sonner"
import FormInput from "@/shared/components/form/FormInput"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
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

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface ExtraServicesFormProps {
  initialValues?: {
    amenities?: string[]
    extraServices?: ExtraServiceInput[]
  }
  pricing?: { vehicleClassId: string; isActive?: boolean }[]
  onSubmit: (data: { amenities: string[]; extraServices: ExtraServiceInput[] }) => void
  onBack: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function ExtraServicesForm({
  initialValues,
  pricing,
  onSubmit,
  onBack,
  onCancel,
  isLoading = false,
}: ExtraServicesFormProps) {
  const { categories, classes, loadData } = useVehicleCatelogStore()

  const activeClassIds = useMemo(() => {
    if (!pricing || pricing.length === 0) return null
    const activeSet = new Set(
      pricing.filter((p) => p.isActive !== false).map((p) => p.vehicleClassId)
    )
    return activeSet
  }, [pricing])

  const [amenities, setAmenities] = useState<string[]>(
    initialValues?.amenities || ["Free WiFi", "Parking", "Waiting Lounge"]
  )
  const [customAmenity, setCustomAmenity] = useState("")

  const allAmenitiesList = useMemo(() => {
    const customList = amenities.filter((a) => !PRESET_AMENITIES.includes(a))
    return [...PRESET_AMENITIES, ...customList]
  }, [amenities])

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

  const [prevInitialValues, setPrevInitialValues] = useState(initialValues)
  if (initialValues !== prevInitialValues) {
    setPrevInitialValues(initialValues)
    if (initialValues?.amenities) {
      setAmenities(initialValues.amenities)
    }
    if (initialValues?.extraServices) {
      setExtraServices(
        initialValues.extraServices.map((s) => ({
          ...s,
          slug: s.slug || slugify(s.name),
        }))
      )
    }
  }

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
    const availableClasses = activeClassIds
      ? classes.filter((c) => activeClassIds.has(c.id))
      : classes

    const newService: ExtraServiceInput = {
      name: "",
      slug: "",
      description: "",
      pricing: availableClasses.map((c) => ({ vehicleClassId: c.id, price: "" as unknown as number })),
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

  const handleServicePriceChange = (serviceIndex: number, classId: string, rawValue: string) => {
    setExtraServices((prev) => {
      const next = [...prev]
      const service = { ...next[serviceIndex] }
      const pricingList = [...(service.pricing || [])]
      const parsed = rawValue === "" ? ("" as unknown as number) : parseFloat(rawValue)
      const val = typeof parsed === "number" && !isNaN(parsed) && parsed >= 0 ? parsed : ("" as unknown as number)

      const idx = pricingList.findIndex((p) => p.vehicleClassId === classId)
      if (idx >= 0) {
        pricingList[idx] = { ...pricingList[idx], price: val }
      } else {
        pricingList.push({ vehicleClassId: classId, price: val })
      }

      service.pricing = pricingList
      next[serviceIndex] = service
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const activeServices = extraServices.filter((s) => !s.isDeleted)

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

      const validPricing = (s.pricing || []).filter(
        (p) =>
          typeof p.price === "number" &&
          !isNaN(p.price) &&
          p.price > 0 &&
          (!activeClassIds || activeClassIds.has(p.vehicleClassId))
      )
      if (validPricing.length === 0) {
        toast.error(`Please enter valid prices for service "${s.name}".`)
        return
      }

      seenNames.set(nameKey, i)
      seenSlugs.set(slugKey, i)
    }

    const processedServices = extraServices.map((s) => ({
      ...s,
      slug: s.slug || slugify(s.name),
      pricing: (s.pricing || []).filter(
        (p) =>
          typeof p.price === "number" &&
          !isNaN(p.price) &&
          p.price > 0 &&
          (!activeClassIds || activeClassIds.has(p.vehicleClassId))
      ),
    }))

    onSubmit({
      amenities,
      extraServices: processedServices,
    })
  }

  const activeExtraServices = extraServices.filter((s) => !s.isDeleted)

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {/* Step Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <span className="text-[12px] font-bold tracking-[2.4px] text-primary uppercase">
          STEP 4 OF 5
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Extra Services & Amenities
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-normal">
          Add details of extra services and amenities supported at your station.
        </p>
      </div>

      {/* Section 1: Extra Services */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider text-primary uppercase">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Wrench size={16} />
            </div>
            <span>EXTRA SERVICES ({activeExtraServices.length})</span>
          </div>
        </div>

        {activeExtraServices.length === 0 ? (
          <div className="text-center p-10 border border-dashed border-border rounded-2xl bg-muted/30 space-y-3">
            <Wrench size={36} className="mx-auto text-muted-foreground" />
            <h4 className="text-sm font-bold text-foreground">No Extra Services Added</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Click below to offer add-on services like Polish, Interior Detailing, Engine Wash, etc.
            </p>
          </div>
        ) : (
          activeExtraServices.map((service, index) => {
            const originalIndex = extraServices.indexOf(service)
            return (
              <div
                key={service.id || `service-${originalIndex}`}
                className="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-sm hover:shadow-md transition-all"
              >
                {/* Service Card Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-extrabold uppercase tracking-wider">
                      SERVICE #{index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      {service.name || "Untitled Service"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveService(originalIndex)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 size={15} />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Service Details Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="SERVICE NAME *"
                    type="text"
                    placeholder="e.g. Foam Polish / Ceramic Coating"
                    value={service.name}
                    onChange={(e) =>
                      handleServiceChange(originalIndex, "name", e.target.value)
                    }
                  />
                  <FormInput
                    label="SLUG (OPTIONAL)"
                    type="text"
                    placeholder="foam-polish"
                    value={service.slug || ""}
                    onChange={(e) =>
                      handleServiceChange(originalIndex, "slug", e.target.value)
                    }
                  />
                </div>

                <FormInput
                  label="DESCRIPTION (OPTIONAL)"
                  type="text"
                  placeholder="Short explanation of what this service covers..."
                  value={service.description || ""}
                  onChange={(e) =>
                    handleServiceChange(originalIndex, "description", e.target.value)
                  }
                />

                {/* Pricing per active category & class - Clean 2-column layout without nested sub-boxes */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
                    PRICING PER ACTIVE VEHICLE CLASS (₹)
                  </span>

                  <div className="space-y-4">
                    {categories.map((category) => {
                      const categoryClasses = classes.filter((cls) => {
                        if (cls.categoryId !== category.id) return false
                        if (activeClassIds && !activeClassIds.has(cls.id)) return false
                        return true
                      })
                      if (categoryClasses.length === 0) return null

                      return (
                        <div key={category.id} className="space-y-2.5">
                          {/* Flat category title header */}
                          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wider uppercase pt-1">
                            {getCategoryIcon(category.name)}
                            <span>{category.name}</span>
                          </div>

                          {/* Minimal 2-column grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {categoryClasses.map((cls) => {
                              const priceItem = (service.pricing || []).find((p) => p.vehicleClassId === cls.id)
                              const rawPrice = priceItem?.price
                              const displayPrice = typeof rawPrice === "number" && !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : ""

                              return (
                                <div
                                  key={cls.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-border transition-colors"
                                >
                                  <span className="text-xs font-semibold text-foreground truncate pr-2">
                                    {cls.name}
                                  </span>
                                  <div className="w-28 sm:w-32 shrink-0">
                                    <FormInput
                                      type="number"
                                      placeholder="50"
                                      prefix="₹"
                                      value={displayPrice}
                                      onChange={(e) =>
                                        handleServicePriceChange(originalIndex, cls.id, e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })
        )}

        <button
          type="button"
          onClick={handleAddService}
          className="w-full py-3.5 border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/60 rounded-2xl flex items-center justify-center gap-2.5 text-muted-foreground hover:text-foreground font-bold text-sm transition-all cursor-pointer active:scale-[0.99]"
        >
          <Plus size={18} className="text-primary" />
          <span>Add Another Extra Service</span>
        </button>
      </div>

      {/* Section 2: Amenities */}
      <div className="space-y-5 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm">
        <div className="space-y-1 border-b border-border pb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2.5">
            <Sparkles size={18} className="text-primary" />
            <span>Station Amenities</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Select on-site facilities available at your station for customers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {allAmenitiesList.map((name) => {
            const isSelected = amenities.includes(name)
            const isCustom = !PRESET_AMENITIES.includes(name)
            return (
              <div
                key={name}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? "bg-primary/10 border-primary/40 text-primary shadow-sm"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAmenity(name)}
                  className="flex items-center gap-2 cursor-pointer outline-none"
                >
                  {isSelected && <Check size={14} className="text-primary" />}
                  <span>{name}</span>
                </button>
                {isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setAmenities((prev) => prev.filter((a) => a !== name))
                    }}
                    className="ml-1 text-muted-foreground hover:text-red-500 transition-colors p-0.5 rounded-md cursor-pointer"
                    title="Remove custom amenity"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-2.5 pt-2">
          <input
            type="text"
            placeholder="Add custom amenity (e.g. EV Charging)"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddCustomAmenity()
              }
            }}
            className="bg-muted/40 text-foreground text-xs px-4 py-2.5 rounded-2xl border border-border outline-none flex-1 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="button"
            onClick={handleAddCustomAmenity}
            className="px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-2xl transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center border-t border-border pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-bold transition-all cursor-pointer"
          >
            Back
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 text-sm font-bold px-8 py-2.5 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{isLoading ? "Saving..." : "Save & Continue"}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}
