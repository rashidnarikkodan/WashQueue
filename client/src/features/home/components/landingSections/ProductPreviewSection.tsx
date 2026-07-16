import { TrendingUp, CheckCircle2 } from "lucide-react"

export default function ProductPreviewSection() {
  return (
    <section className="py-24 border-b border-border bg-background/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Column 1: UI Mockup Panel */}
        <div className="relative p-6 sm:p-8 rounded-[2rem] border border-border bg-card/35 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header Dots Mockup */}
          <div className="flex justify-between items-center mb-6 border-b border-border/60 pb-4">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              WASH_ENGINE_v4.2
            </span>
          </div>

          {/* Station Card UI */}
          <div className="p-5 rounded-2xl bg-background/40 border border-border/50 mb-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-foreground text-sm sm:text-base">
                South Bay Detailing
              </h4>
              <span className="font-bold text-primary text-sm sm:text-base">$38.00</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Queue Length indicator */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                  QUEUE LENGTH
                </span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-6 rounded-sm bg-primary" />
                  <span className="w-1.5 h-6 rounded-sm bg-primary" />
                  <span className="w-1.5 h-6 rounded-sm bg-muted" />
                  <span className="w-1.5 h-6 rounded-sm bg-muted" />
                </div>
              </div>
              {/* Wait time */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                  WAIT TIME
                </span>
                <span className="text-base font-extrabold text-emerald-400 block">~ 8 Min</span>
              </div>
            </div>
          </div>

          {/* Queue Status UI */}
          <div className="p-5 rounded-2xl bg-background/40 border border-border/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  Tesla Model 3 • Deep Polish
                </p>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1.5 relative">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">65%</span>
            </div>
          </div>
        </div>

        {/* Column 2: Details List */}
        <div className="flex flex-col items-start text-left space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Granular Control for Premium Detailing.
          </h2>
          <p className="text-base text-muted-foreground font-normal leading-relaxed">
            Our interface is designed to provide maximum information density without the clutter.
            From pricing transparency to live wash progress, every interaction is built for the
            premium vehicle owner.
          </p>

          <ul className="space-y-4 pt-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5.5 w-5.5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground">
                Automated service validation upon arrival
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5.5 w-5.5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground">
                Digital receipting with detail photos
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5.5 w-5.5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground">
                Multi-vehicle garage management
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
