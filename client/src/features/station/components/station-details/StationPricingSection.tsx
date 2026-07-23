import { useState, useEffect, useMemo } from "react"
import { Car, Bike, Truck, Sparkles } from "lucide-react"
import type { StationPricing } from "../../types"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/vehicleCatelogStore"
import FormSelect from "@/shared/components/form/FormSelect"

interface StationPricingSectionProps {
  pricing?: StationPricing[]
}

export function StationPricingSection({ pricing = [] }: StationPricingSectionProps) {
  const { categories, classes, loadData } = useVehicleCatelogStore()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [loadData])

  // Map active pricing entries for this station
  const activePricingMap = useMemo(() => {
    const map = new Map<string, StationPricing>()
    pricing.forEach((p) => {
      if (
        p.isActive !== false &&
        ((p.halfWashPrice && p.halfWashPrice > 0) || (p.fullWashPrice && p.fullWashPrice > 0))
      ) {
        map.set(p.vehicleClassId, p)
      }
    })
    return map
  }, [pricing])

  // Filter categories that have at least one active vehicle class configured for this station
  const availableCategories = useMemo(() => {
    return categories.filter((cat) =>
      classes.some((c) => c.categoryId === cat.id && activePricingMap.has(c.id))
    )
  }, [categories, classes, activePricingMap])

  const categoryOptions = [
    { value: "all", label: "All Active Categories" },
    ...availableCategories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ]

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("two") || lower.includes("bike") || lower.includes("motorcycle"))
      return <Bike size={18} className="text-primary" />
    if (lower.includes("lorry") || lower.includes("truck") || lower.includes("bus"))
      return <Truck size={18} className="text-primary" />
    return <Car size={18} className="text-primary" />
  }

  const displayedCategories =
    selectedCategoryId === "all"
      ? availableCategories
      : availableCategories.filter((cat) => cat.id === selectedCategoryId)

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Wash Services &amp; Pricing
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Standard half wash and full wash pricing for vehicle classes supported at this station.
          </p>
        </div>

        {/* Category Dropdown Pill */}
        {availableCategories.length > 1 && (
          <div className="w-full sm:w-64">
            <FormSelect
              label=""
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              options={categoryOptions}
              leftIcon={<Sparkles size={16} className="text-primary" />}
            />
          </div>
        )}
      </div>

      {/* Pricing Cards Grouped by Category */}
      <div className="space-y-6">
        {displayedCategories.length > 0 ? (
          displayedCategories.map((category) => {
            const catClasses = classes.filter(
              (c) => c.categoryId === category.id && activePricingMap.has(c.id)
            )
            if (catClasses.length === 0) return null

            return (
              <div
                key={category.id}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Category Header Banner */}
                <div className="px-6 py-3.5 bg-muted/60 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(category.name)}
                    <span className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-1 rounded-full border border-border">
                    {catClasses.length} {catClasses.length === 1 ? "Class" : "Classes"}
                  </span>
                </div>

                {/* Table Column Headers */}
                <div className="grid grid-cols-12 px-6 py-3 border-b border-border/80 bg-muted/20 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  <div className="col-span-6">Vehicle Class</div>
                  <div className="col-span-3 text-right">Half Wash</div>
                  <div className="col-span-3 text-right">Full Wash</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border/60">
                  {catClasses.map((cls) => {
                    const priceItem = activePricingMap.get(cls.id)
                    if (!priceItem) return null

                    return (
                      <div
                        key={cls.id}
                        className="grid grid-cols-12 px-6 py-4.5 items-center hover:bg-muted/40 transition-colors"
                      >
                        <div className="col-span-6 space-y-1">
                          <h4 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                            <span>{cls.name}</span>
                          </h4>
                          {cls.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {cls.description}
                            </p>
                          )}
                        </div>

                        <div className="col-span-3 text-right">
                          <span className="font-black text-lg sm:text-xl text-primary">
                            ₹{priceItem.halfWashPrice}
                          </span>
                        </div>

                        <div className="col-span-3 text-right">
                          <span className="font-black text-lg sm:text-xl text-primary">
                            ₹{priceItem.fullWashPrice}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm border border-border rounded-2xl bg-card">
            No active vehicle wash services offered for this station.
          </div>
        )}
      </div>
    </div>
  )
}
