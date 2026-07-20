import { useState, useEffect } from "react"
import { ArrowRight, Car, Bike, Truck } from "lucide-react"
import FormSwitch from "@/shared/components/form/FormSwitch"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/vehicleCatelogStore"

export interface PricingItem {
  vehicleClassId: string
  halfWashPrice: number
  fullWashPrice: number
  isActive: boolean
}

interface PricingConfigurationFormProps {
  initialValues?: PricingItem[]
  onSubmit: (pricing: PricingItem[]) => void
  onBack: () => void
  isLoading?: boolean
}

export default function PricingConfigurationForm({
  initialValues = [],
  onSubmit,
  onBack,
  isLoading = false,
}: PricingConfigurationFormProps) {
  const { categories, classes, loadData } = useVehicleCatelogStore()
  const [pricingState, setPricingState] = useState<Record<string, PricingItem>>({})
  const [categoryActive, setCategoryActive] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadData()
  }, [loadData])

  // Map initial values or set defaults when classes load
  useEffect(() => {
    if (classes.length > 0) {
      const state: Record<string, PricingItem> = {}
      classes.forEach((cls) => {
        const existing = initialValues.find((p) => p.vehicleClassId === cls.id)
        state[cls.id] = {
          vehicleClassId: cls.id,
          halfWashPrice: existing?.halfWashPrice ?? 150,
          fullWashPrice: existing?.fullWashPrice ?? 300,
          isActive: existing?.isActive ?? true,
        }
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPricingState(state)

      if (categories.length > 0) {
        const catActive: Record<string, boolean> = {}
        categories.forEach((cat) => {
          const catClasses = classes.filter((c) => c.categoryId === cat.id)
          const isCatActive = catClasses.length > 0 && catClasses.some((c) => {
            const item = initialValues.find((p) => p.vehicleClassId === c.id)
            return item ? item.isActive : true
          })
          catActive[cat.id] = isCatActive
        })
        setCategoryActive(catActive)
      }
    }
  }, [classes, categories, initialValues])

  const handlePriceChange = (classId: string, field: "halfWashPrice" | "fullWashPrice", value: number) => {
    setPricingState((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [field]: value < 0 ? 0 : value,
      },
    }))
  }

  const handleClassToggle = (classId: string, isActive: boolean) => {
    setPricingState((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        isActive,
      },
    }))
  }

  const handleCategoryToggle = (catId: string, isActive: boolean) => {
    setCategoryActive((prev) => ({
      ...prev,
      [catId]: isActive,
    }))

    // Batch update active status for all classes under this category
    const catClasses = classes.filter((cls) => cls.categoryId === catId)
    setPricingState((prev) => {
      const next = { ...prev }
      catClasses.forEach((cls) => {
        if (next[cls.id]) {
          next[cls.id] = { ...next[cls.id], isActive }
        }
      })
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pricingList = Object.values(pricingState)
    onSubmit(pricingList)
  }

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("two") || lower.includes("bike") || lower.includes("motorcycle")) return <Bike size={18} />
    if (lower.includes("lorry") || lower.includes("truck") || lower.includes("bus")) return <Truck size={18} />
    return <Car size={18} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <span className="text-[12px] font-bold tracking-[2.4px] text-[#ADC6FF] uppercase">
          STEP 3 OF 5
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DCE1FB] tracking-tight">
          Price Configuration
        </h1>
        <p className="text-sm sm:text-base text-[#C2C6D6] opacity-80 font-normal">
          Set pricing for vehicle types you service. Toggle off categories you don't support.
        </p>
      </div>

      {/* Categories Accordion */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryClasses = classes.filter((cls) => cls.categoryId === category.id)
          if (categoryClasses.length === 0) return null

          const isActive = categoryActive[category.id] ?? true

          return (
            <div
              key={category.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isActive ? "border-slate-800/80 bg-[#191B23]" : "border-slate-800/40 bg-[#14161F]/60 opacity-80"
              }`}
            >
              {/* Category Header */}
              <div
                className={`flex items-center justify-between px-6 py-4 transition-colors select-none ${
                  isActive ? "bg-[#223553]" : "bg-[#1A2536]"
                }`}
              >
                <div className="flex items-center gap-3 text-[#E1E2EC] font-bold text-sm tracking-wider uppercase">
                  <div className={isActive ? "text-[#ADC6FF]" : "text-slate-500"}>
                    {getCategoryIcon(category.name)}
                  </div>
                  <span>{category.name}</span>
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {isActive ? "Active Category" : "Inactive Category"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FormSwitch
                    label={isActive ? "Active" : "Inactive"}
                    checked={isActive}
                    onChange={(checked) => handleCategoryToggle(category.id, checked)}
                  />
                </div>
              </div>

              {/* Category Content */}
              {isActive && (
                <div className="p-4 sm:p-6 bg-[#1E293B] space-y-3 animate-in fade-in duration-200">
                  <div className="hidden sm:grid grid-cols-4 px-4 py-2 text-[11px] font-bold tracking-wider text-[#8C909F] uppercase">
                    <div>CLASS</div>
                    <div className="text-right">HALF WASH PRICE</div>
                    <div className="text-right">FULL WASH PRICE</div>
                    <div className="text-right">AVAILABLE</div>
                  </div>

                  <div className="space-y-2.5">
                    {categoryClasses.map((cls) => {
                      const item = pricingState[cls.id] || {
                        vehicleClassId: cls.id,
                        halfWashPrice: 150,
                        fullWashPrice: 300,
                        isActive: true,
                      }

                      return (
                        <div
                          key={cls.id}
                          className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-3 sm:gap-0 p-4 rounded-xl bg-[#191F31] border border-slate-800/40"
                        >
                          <div className="font-semibold text-sm text-[#E5E5E5]">
                            {cls.name}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                            <span className="sm:hidden text-xs text-[#8C909F] font-semibold">HALF WASH:</span>
                            <div className="flex items-center rounded-lg border border-blue-500/50 bg-[#1E293B] px-3 py-1.5 w-32">
                              <span className="text-xs text-[#8C909F] mr-2">₹</span>
                              <input
                                type="number"
                                min={0}
                                disabled={!item.isActive}
                                value={item.halfWashPrice}
                                onChange={(e) =>
                                  handlePriceChange(cls.id, "halfWashPrice", parseFloat(e.target.value) || 0)
                                }
                                className="w-full bg-transparent text-right text-sm text-[#E5E5E5] font-semibold outline-none disabled:opacity-40"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                            <span className="sm:hidden text-xs text-[#8C909F] font-semibold">FULL WASH:</span>
                            <div className="flex items-center rounded-lg border border-blue-500/50 bg-[#1E293B] px-3 py-1.5 w-32">
                              <span className="text-xs text-[#8C909F] mr-2">₹</span>
                              <input
                                type="number"
                                min={0}
                                disabled={!item.isActive}
                                value={item.fullWashPrice}
                                onChange={(e) =>
                                  handlePriceChange(cls.id, "fullWashPrice", parseFloat(e.target.value) || 0)
                                }
                                className="w-full bg-transparent text-right text-sm text-[#E5E5E5] font-semibold outline-none disabled:opacity-40"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                            <span className="sm:hidden text-xs text-[#8C909F] font-semibold">AVAILABLE:</span>
                            <FormSwitch
                              checked={item.isActive}
                              onChange={(checked) => handleClassToggle(cls.id, checked)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center border-t border-slate-800/80 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-bold transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#ADC6FF] text-[#002E6A] hover:bg-blue-300 disabled:opacity-50 text-sm font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{isLoading ? "Saving..." : "Continue"}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}
