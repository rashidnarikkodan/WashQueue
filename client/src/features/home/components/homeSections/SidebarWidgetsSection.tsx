import { TrendingUp, Gauge, Thermometer } from "lucide-react"
import { MOCK_DASHBOARD_DATA } from "../../mock/dashboard.mock"

export default function SidebarWidgetsSection() {
  const data = MOCK_DASHBOARD_DATA

  return (
    <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-right duration-500 text-left">
      {/* Queue Intelligence Card */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
          Queue Intelligence
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-card p-3.5 rounded-2xl border border-border/30">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-primary border border-border shadow-md">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Average Wait</p>
              <p className="text-base font-black text-foreground">
                {data.queueIntelligence.averageWait}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-3.5 rounded-2xl border border-border/30">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-emerald-400 border border-border shadow-md">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Wash Speed</p>
              <p className="text-base font-black text-foreground">
                {data.queueIntelligence.washSpeed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Insights Card */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="text-amber-400">
              <Thermometer className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Weather Insights</h4>
          </div>
          <span className="text-lg font-black text-foreground">
            {data.weatherInsights.temperature}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-black text-primary uppercase tracking-widest">
            {data.weatherInsights.alertTitle}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
            {data.weatherInsights.alertDetails}
          </p>
        </div>
      </div>
    </div>
  )
}
