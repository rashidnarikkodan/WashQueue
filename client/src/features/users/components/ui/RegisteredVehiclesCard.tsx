import { Car } from "lucide-react"
import type { Vehicle } from "../../types"

interface RegisteredVehiclesCardProps {
  vehicles: Vehicle[]
}

export default function RegisteredVehiclesCard({ vehicles }: RegisteredVehiclesCardProps) {
  return (
    <div className="border border-border bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Car size={16} className="text-[#ADC6FF]" />
          <h2 className="text-base font-black uppercase text-foreground tracking-widest">
            Registered Vehicles
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {vehicles.length === 0 ? (
          <div className="sm:col-span-2 py-6 text-center text-muted-foreground text-xs font-semibold">
            No vehicles registered yet.
          </div>
        ) : (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-4 bg-[#1b253b]/40 border border-border/40 p-4 rounded-2xl hover:border-border/60 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-[#ADC6FF] border border-border">
                <Car size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-foreground truncate">{v.name}</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                  PLATE:{" "}
                  <span className="font-mono text-muted-foreground font-medium">{v.plate}</span>
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{v.addedDate}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
