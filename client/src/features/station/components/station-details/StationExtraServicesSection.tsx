import type { ExtraService } from "../../types"

interface StationExtraServicesSectionProps {
  extraServices?: ExtraService[]
}

export function StationExtraServicesSection({ extraServices = [] }: StationExtraServicesSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
        Extra Services &amp; Amenities
      </h2>

      {extraServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {extraServices.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                  Add-on Service
                </span>
                <h4 className="text-lg font-bold text-slate-100">{service.name}</h4>
                {service.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Price</span>
                <span className="text-base font-black text-blue-400">
                  ₹{service.pricing?.[0]?.price ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-sm border border-slate-800 rounded-2xl bg-slate-900/60">
          No extra services configured for this station.
        </div>
      )}
    </div>
  )
}
