import { useState, useEffect } from "react"
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

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ]

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("two") || lower.includes("bike") || lower.includes("motorcycle"))
      return <Bike size={18} className="text-blue-400" />
    if (lower.includes("lorry") || lower.includes("truck") || lower.includes("bus"))
      return <Truck size={18} className="text-blue-400" />
    return <Car size={18} className="text-blue-400" />
  }

  const filteredCategories =
    selectedCategoryId === "all"
      ? categories
      : categories.filter((cat) => cat.id === selectedCategoryId)

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Wash Services &amp; Pricing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard half wash and full wash pricing for all supported vehicle classes.
          </p>
        </div>

        {/* Category Dropdown Pill using FormSelect */}
        <div className="w-full sm:w-64">
          <FormSelect
            label=""
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            options={categoryOptions}
            leftIcon={<Sparkles size={16} className="text-[#ADC6FF]" />}
          />
        </div>
      </div>

      {/* Pricing Cards Grouped by Category */}
      <div className="space-y-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const catClasses = classes.filter((c) => c.categoryId === category.id)
            if (catClasses.length === 0) return null

            return (
              <div
                key={category.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl"
              >
                {/* Category Header Banner */}
                <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(category.name)}
                    <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
                    {catClasses.length} {catClasses.length === 1 ? "Class" : "Classes"}
                  </span>
                </div>

                {/* Table Column Headers */}
                <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-800/80 bg-slate-950/20 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  <div className="col-span-6">Vehicle Class</div>
                  <div className="col-span-3 text-right">Half Wash</div>
                  <div className="col-span-3 text-right">Full Wash</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-800/60">
                  {catClasses.map((cls) => {
                    const priceItem = pricing.find((p) => p.vehicleClassId === cls.id)
                    const isConfigured = !!priceItem
                    const isActive = priceItem ? priceItem.isActive : false

                    return (
                      <div
                        key={cls.id}
                        className={`grid grid-cols-12 px-6 py-4.5 items-center transition-colors ${
                          isConfigured && isActive ? "hover:bg-blue-500/[0.02]" : "opacity-50 bg-slate-950/40"
                        }`}
                      >
                        <div className="col-span-6 space-y-1">
                          <h4 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                            <span>{cls.name}</span>
                            {(!isConfigured || !isActive) && (
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded">
                                {!isConfigured ? "Not Configured" : "Not Offered"}
                              </span>
                            )}
                          </h4>
                          {cls.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {cls.description}
                            </p>
                          )}
                        </div>

                        <div className="col-span-3 text-right">
                          {isConfigured && isActive ? (
                            <span className="font-black text-lg sm:text-xl text-blue-400">
                              ₹{priceItem.halfWashPrice}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 italic">—</span>
                          )}
                        </div>

                        <div className="col-span-3 text-right">
                          {isConfigured && isActive ? (
                            <span className="font-black text-lg sm:text-xl text-blue-400">
                              ₹{priceItem.fullWashPrice}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 italic">—</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          /* Fallback when categories are loading or empty */
          <div className="p-8 text-center text-slate-400 text-sm border border-slate-800 rounded-2xl bg-slate-900/60">
            No vehicle pricing categories available.
          </div>
        )}
      </div>
    </div>
  )
}

