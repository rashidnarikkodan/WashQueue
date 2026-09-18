import { Building2, MapPin, Phone, MessageSquare, Clock } from "lucide-react"
import type { StationDetailsSnapshot } from "../types/issue.types"

interface StationContactCardProps {
  station?: StationDetailsSnapshot
}

export default function StationContactCard({ station }: StationContactCardProps) {
  const stationName = station?.name || "WashQueue Service Station"
  const stationCity = station?.city || "Station Support"
  const stationAddress = station?.address || "Service Bay"
  const stationPhone = station?.phone || "+91 98765 00000"

  const handleCall = () => {
    window.location.href = `tel:${stationPhone.replace(/\s+/g, "")}`
  }

  return (
    <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4 text-left">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Building2 className="w-6 h-6" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <h4 className="text-sm font-bold text-foreground truncate">{stationName}</h4>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0 text-primary" />
            <span>{stationCity}</span>
          </p>
        </div>
      </div>

      {stationAddress && (
        <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
          <span className="text-[10px] font-bold text-foreground block uppercase tracking-wider">
            Station Address
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{stationAddress}</p>
        </div>
      )}

      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            Support Hours
          </span>
          <span className="font-bold text-foreground">08:00 AM - 09:00 PM</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            Assigned Desk
          </span>
          <span className="font-bold text-emerald-400">Station Supervisor</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCall}
        className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
      >
        <Phone className="w-4 h-4" />
        <span>Call Station Support</span>
      </button>
    </div>
  )
}
