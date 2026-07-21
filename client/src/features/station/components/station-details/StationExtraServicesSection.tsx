import { useState } from "react"
import { Plus, Check } from "lucide-react"
import type { ExtraService } from "../../types"

interface StationExtraServicesSectionProps {
  extraServices?: ExtraService[]
}

export function StationExtraServicesSection({ extraServices = [] }: StationExtraServicesSectionProps) {
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({})

  const toggleService = (id: string) => {
    setSelectedServices((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const defaultServices = [
    { id: "es-1", name: "Tire Polish", price: 150 },
    { id: "es-2", name: "Premium Fragrance", price: 100 },
    { id: "es-3", name: "Rain Repel Glass", price: 250 },
  ]

  const displayList = extraServices.length > 0
    ? extraServices.map((es) => ({
        id: es.id,
        name: es.name,
        price: es.pricing?.[0]?.price || 150,
      }))
    : defaultServices

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
        Extra Services
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {displayList.map((service) => {
          const isSelected = !!selectedServices[service.id]
          return (
            <div
              key={service.id}
              className={`p-6 rounded-2xl border transition-all flex justify-between items-center bg-slate-900/90 shadow-xl ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/[0.04]"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                  Add-on
                </span>
                <h4 className="text-lg font-bold text-slate-100">{service.name}</h4>
                <p className="text-sm font-semibold text-slate-400">₹{service.price}</p>
              </div>

              <button
                onClick={() => toggleService(service.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                title={isSelected ? "Remove service" : "Add service"}
              >
                {isSelected ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
