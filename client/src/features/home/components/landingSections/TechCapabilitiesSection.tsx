import { Cpu, Layers } from "lucide-react"

export default function TechCapabilitiesSection() {
  return (
    <section className="py-24 border-b border-border bg-background/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-[2.5rem] border border-border bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col items-start text-left space-y-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                The Tech Stack Behind the Stream.
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 h-fit">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">Redis-Based Queue Engine</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sub-millisecond queue priority handling using low-latency in-memory data
                      structures.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 h-fit">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">
                      Socket.io Bi-Directional Updates
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Instant state synchronization between detailing bays and user dashboards
                      without polling.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="p-6 rounded-2xl border border-border bg-background/40 hover:-translate-y-1 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary block">42ms</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-2">
                  UPDATE LATENCY
                </span>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-background/40 hover:-translate-y-1 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary block">12k+</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-2">
                  ACTIVE NODES
                </span>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-background/40 hover:-translate-y-1 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary block">
                  99.9%
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-2">
                  UPTIME SLA
                </span>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-background/40 hover:-translate-y-1 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary block">Zero</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-2">
                  MANUAL ERRORS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
