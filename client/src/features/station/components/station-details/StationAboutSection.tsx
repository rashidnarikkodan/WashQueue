import { ShieldCheck, Leaf, Clock, Info } from "lucide-react"

interface StationAboutSectionProps {
  stationName: string
  description?: string
}

export function StationAboutSection({ stationName, description }: StationAboutSectionProps) {
  return (
    <div className="p-8 rounded-2xl border border-border bg-card shadow-xl space-y-6 relative overflow-hidden">
      {/* Subtle Background Watermark Icon */}
      <Info size={120} className="absolute -right-8 -bottom-8 text-border/30 pointer-events-none" />

      <div className="space-y-3 relative z-10">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          About {stationName}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-5xl break-words">
          {description || "No description provided for this station."}
        </p>
      </div>

      {/* Feature Badges Grid */}
      <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-border/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Certified Pro
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Leaf size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Eco-Friendly
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            24/7 Access
          </span>
        </div>
      </div>
    </div>
  )
}
