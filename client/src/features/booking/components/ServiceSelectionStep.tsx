import { Check, Sparkles, Clock } from "lucide-react"

export interface ServicePlanOption {
  id: string
  name: string
  price: number
  durationMins: number
  description: string
  features?: string[]
}

export interface ExtraServiceOption {
  id: string
  name: string
  price: number
  description?: string
}

interface ServiceSelectionStepProps {
  plans: ServicePlanOption[]
  selectedPlanId: string | null
  onSelectPlan: (id: string) => void
  extraServices: ExtraServiceOption[]
  selectedExtraIds: string[]
  onToggleExtra: (id: string) => void
}

export default function ServiceSelectionStep({
  plans,
  selectedPlanId,
  onSelectPlan,
  extraServices,
  selectedExtraIds,
  onToggleExtra,
}: ServiceSelectionStepProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="flex items-center gap-4 w-full">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-primary/20">
          2
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Service Type & Packages
        </h2>
      </div>

      {/* Main Wash Packages Grid */}
      <div className="flex  gap-4 w-full">
        {plans.map((p) => {
          const isSelected = selectedPlanId === p.id
          return (
            <div
              key={p.id}
              onClick={() => onSelectPlan(p.id)}
              className={`relative flex flex-col justify-between p-6 rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden text-left ${
                isSelected
                  ? "border-2 border-primary bg-primary/5 shadow-xl"
                  : "border-border bg-card hover:border-primary/50 shadow-sm"
              }`}
            >
              {/* Header: Title & Price */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{p.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Clock size={13} className="shrink-0 text-muted-foreground" />
                    <span>Est. {p.durationMins} mins</span>
                  </div>
                </div>

                <div className="text-2xl font-black text-primary shrink-0">
                  ₹{p.price.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                {p.description}
              </p>

              {/* Select Plan Button */}
              <div
                className={`mt-auto flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>{isSelected ? "Selected Plan" : "Select Package"}</span>
                {isSelected ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <Sparkles size={14} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Extra Add-On Services Section */}
      {extraServices.length > 0 && (
        <div className="mt-4 space-y-3 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Optional Add-On Extra Services
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {extraServices.map((e) => {
              const isChecked = selectedExtraIds.includes(e.id)
              return (
                <div
                  key={e.id}
                  onClick={() => onToggleExtra(e.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-muted"
                      }`}
                    >
                      {isChecked && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{e.name}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    +₹{e.price.toLocaleString("en-IN")}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
