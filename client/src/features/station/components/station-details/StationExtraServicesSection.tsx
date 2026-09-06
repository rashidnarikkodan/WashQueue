import type { ExtraService } from "../../types"

interface StationExtraServicesSectionProps {
  extraServices?: ExtraService[]
}

export function StationExtraServicesSection({
  extraServices = [],
}: StationExtraServicesSectionProps) {
  const activeExtraServices = extraServices.filter((s) => s.isActive !== false)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight">
        Extra Services &amp; Amenities
      </h2>

      {activeExtraServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {activeExtraServices.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  Add-on Service
                </span>
                <h4 className="text-lg font-bold text-foreground">{service.name}</h4>
                {service.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Price</span>
                <span className="text-base font-black text-primary">
                  ₹{service.pricing?.[0]?.price ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground text-sm border border-border rounded-2xl bg-card">
          No extra services configured for this station.
        </div>
      )}
    </div>
  )
}
