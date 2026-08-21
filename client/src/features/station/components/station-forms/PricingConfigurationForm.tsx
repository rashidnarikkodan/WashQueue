import { useState, useEffect } from "react"
import { ArrowRight, Car, Bike, Truck } from "lucide-react"
import FormInput from "@/shared/components/form/FormInput"
import FormSwitch from "@/shared/components/form/FormSwitch"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"

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
  onCancel?: () => void
  isLoading?: boolean
}

export default function PricingConfigurationForm({
  initialValues = [],
  onSubmit,
  onBack,
  onCancel,
  isLoading = false,
}: PricingConfigurationFormProps) {
  const { categories, classes, loadData } = useVehicleCatelogStore()
  const [pricingState, setPricingState] = useState<Record<string, PricingItem>>({})
  const [categoryActive, setCategoryActive] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (classes.length > 0) {
      const state: Record<string, PricingItem> = {}
      classes.forEach((cls) => {
        const existing = initialValues.find((p) => p.vehicleClassId === cls.id)
        state[cls.id] = {
          vehicleClassId: cls.id,
          halfWashPrice:
            existing && typeof existing.halfWashPrice === "number" && existing.halfWashPrice > 0
              ? existing.halfWashPrice
              : ("" as unknown as number),
          fullWashPrice:
            existing && typeof existing.fullWashPrice === "number" && existing.fullWashPrice > 0
              ? existing.fullWashPrice
              : ("" as unknown as number),
          isActive: existing ? (existing.isActive ?? false) : false,
        }
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPricingState(state)

      if (categories.length > 0) {
        const catActive: Record<string, boolean> = {}
        categories.forEach((cat) => {
          const catClasses = classes.filter((c) => c.categoryId === cat.id)
          const isCatActive =
            catClasses.length > 0 &&
            catClasses.some((c) => {
              const item = initialValues.find((p) => p.vehicleClassId === c.id)
              return item ? item.isActive === true : false
            })
          catActive[cat.id] = isCatActive
        })
        setCategoryActive(catActive)
      }
    }
  }, [classes, categories, initialValues])

  const handlePriceChange = (
    classId: string,
    field: "halfWashPrice" | "fullWashPrice",
    rawValue: string
  ) => {
    const parsed = rawValue === "" ? ("" as unknown as number) : parseFloat(rawValue)
    const val =
      typeof parsed === "number" && !isNaN(parsed) && parsed >= 0
        ? parsed
        : ("" as unknown as number)
    setPricingState((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [field]: val,
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

    if (isActive) {
      const cls = classes.find((c) => c.id === classId)
      if (cls) {
        setCategoryActive((prev) => ({
          ...prev,
          [cls.categoryId]: true,
        }))
      }
    }
  }

  const handleCategoryToggle = (catId: string, isActive: boolean) => {
    setCategoryActive((prev) => ({
      ...prev,
      [catId]: isActive,
    }))

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

  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const missingPriceClasses: string[] = []
    const finalPricing: PricingItem[] = []

    classes.forEach((cls) => {
      const catIsActive = categoryActive[cls.categoryId] ?? false
      const item = pricingState[cls.id]
      const isClassActive = item?.isActive ?? false

      if (catIsActive && isClassActive) {
        const half =
          typeof item?.halfWashPrice === "number" && !isNaN(item.halfWashPrice)
            ? item.halfWashPrice
            : 0
        const full =
          typeof item?.fullWashPrice === "number" && !isNaN(item.fullWashPrice)
            ? item.fullWashPrice
            : 0

        if (half <= 0 || full <= 0) {
          missingPriceClasses.push(cls.name)
        } else {
          finalPricing.push({
            vehicleClassId: cls.id,
            halfWashPrice: half,
            fullWashPrice: full,
            isActive: true,
          })
        }
      } else {
        finalPricing.push({
          vehicleClassId: cls.id,
          halfWashPrice:
            typeof item?.halfWashPrice === "number" && !isNaN(item.halfWashPrice)
              ? item.halfWashPrice
              : 0,
          fullWashPrice:
            typeof item?.fullWashPrice === "number" && !isNaN(item.fullWashPrice)
              ? item.fullWashPrice
              : 0,
          isActive: false,
        })
      }
    })

    if (missingPriceClasses.length > 0) {
      setFormError(
        `Please enter valid positive Half Wash & Full Wash prices for: ${missingPriceClasses.join(", ")}`
      )
      return
    }

    const activePricing = finalPricing.filter((p) => p.isActive)
    if (activePricing.length === 0) {
      setFormError("Please activate at least one vehicle category and configure valid prices.")
      return
    }

    setFormError(null)
    onSubmit(finalPricing)
  }

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("two") || lower.includes("bike") || lower.includes("motorcycle"))
      return <Bike size={18} />
    if (lower.includes("lorry") || lower.includes("truck") || lower.includes("bus"))
      return <Truck size={18} />
    return <Car size={18} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      <div className="space-y-2 border-b border-border pb-6">
        <span className="text-[12px] font-bold tracking-[2.4px] text-primary uppercase">
          STEP 3 OF 5
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Price Configuration
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-normal">
          Set pricing for vehicle types you service. Toggle off categories you don't support.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold flex items-center gap-2">
          <span>{formError}</span>
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => {
          const categoryClasses = classes.filter((cls) => cls.categoryId === category.id)
          if (categoryClasses.length === 0) return null

          const isActive = categoryActive[category.id] ?? false

          return (
            <div
              key={category.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isActive
                  ? "border-border bg-card shadow-sm hover:shadow-md"
                  : "border-border/50 bg-muted/30 opacity-75"
              }`}
            >
              <div
                className={`flex items-center justify-between px-6 py-4 transition-colors select-none ${
                  isActive ? "bg-muted/60" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3 text-foreground font-bold text-sm tracking-wider uppercase">
                  <div className={isActive ? "text-primary" : "text-muted-foreground"}>
                    {getCategoryIcon(category.name)}
                  </div>
                  <span>{category.name}</span>
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground border border-border"
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

              {isActive && (
                <div className="p-4 sm:p-6 bg-card space-y-3 animate-in fade-in duration-200">
                  <div className="hidden sm:grid grid-cols-4 px-4 py-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    <div>CLASS</div>
                    <div className="text-right">HALF WASH PRICE</div>
                    <div className="text-right">FULL WASH PRICE</div>
                    <div className="text-right">AVAILABLE</div>
                  </div>

                  <div className="space-y-2.5">
                    {categoryClasses.map((cls) => {
                      const item = pricingState[cls.id] || {
                        vehicleClassId: cls.id,
                        halfWashPrice: "" as unknown as number,
                        fullWashPrice: "" as unknown as number,
                        isActive: false,
                      }

                      return (
                        <div
                          key={cls.id}
                          className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-3 sm:gap-0 p-4 rounded-xl bg-muted/40 border border-border/60 hover:border-border transition-colors"
                        >
                          <div className="font-semibold text-sm text-foreground">{cls.name}</div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                            <span className="sm:hidden text-xs text-muted-foreground font-semibold">
                              HALF WASH:
                            </span>
                            <div className="w-36 sm:w-32">
                              <FormInput
                                type="number"
                                placeholder="150"
                                prefix="₹"
                                disabled={!item.isActive}
                                value={item.halfWashPrice ?? ""}
                                onChange={(e) =>
                                  handlePriceChange(cls.id, "halfWashPrice", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                            <span className="sm:hidden text-xs text-muted-foreground font-semibold">
                              FULL WASH:
                            </span>
                            <div className="w-36 sm:w-32">
                              <FormInput
                                type="number"
                                placeholder="300"
                                prefix="₹"
                                disabled={!item.isActive}
                                value={item.fullWashPrice ?? ""}
                                onChange={(e) =>
                                  handlePriceChange(cls.id, "fullWashPrice", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full">
                            <span className="sm:hidden text-xs text-muted-foreground font-semibold">
                              AVAILABLE:
                            </span>
                            <FormSwitch
                              checked={item.isActive}
                              onChange={(checked) => handleClassToggle(cls.id, checked)}
                              className="w-auto"
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
