import { Activity, Coins, Clock, Calendar, ArrowRight } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-card/15 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Headers */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="flex flex-col items-start space-y-3">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">
              THE PLATFORM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Engineered for Efficiency.
            </h2>
          </div>
          <p className="text-base text-muted-foreground max-w-md md:text-right font-normal">
            Traditional car washes rely on guesswork. We use a high-frequency polling engine to
            ensure you know exactly when your vehicle will be serviced.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
          {/* Box 1: Real-Time Queue Tracking (Large) */}
          <div className="md:col-span-8 p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col justify-between relative group hover:border-primary/45 transition-colors duration-300">
            <div className="absolute -bottom-8 -right-8 w-1/2 h-[60%] opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-500">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/aa66c86536f6d1760602c2a35449cf7ce79ac9cd?width=1068"
                alt="Telemetry tracker"
                className="w-full h-full object-cover rounded-tl-2xl border-l border-t border-border/40"
              />
            </div>
            <div className="space-y-4 max-w-md relative z-10">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Real-Time Queue Tracking
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our live telemetry feeds update every 2 seconds, providing a granular view of every
                bay's status across the entire network.
              </p>
            </div>
            <div className="text-xs text-primary font-semibold flex items-center gap-1.5 hover:underline cursor-pointer">
              <span>View Live Streams</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Box 2: Vehicle-Aware Pricing (Small) */}
          <div className="md:col-span-4 p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm flex flex-col justify-between hover:border-primary/45 transition-colors duration-300">
            <div className="space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Vehicle-Aware Pricing
              </h3>
              <p className="text-sm text-muted-foreground">
                Dynamic pricing that adapts to your vehicle's size and service requirements
                instantly.
              </p>
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
              No Hidden Fees
            </span>
          </div>

          {/* Box 3: Smart Estimation (Small) */}
          <div className="md:col-span-4 p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm flex flex-col justify-between hover:border-primary/45 transition-colors duration-300">
            <div className="space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Smart Estimation</h3>
              <p className="text-sm text-muted-foreground">
                ML-powered wait times that account for historical traffic patterns and staff
                availability.
              </p>
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
              Predictive Logic
            </span>
          </div>

          {/* Box 4: Instant Booking (Medium) */}
          <div className="md:col-span-8 p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm flex flex-col justify-between hover:border-primary/45 transition-colors duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Instant Slot Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Lock in your time slot with a single tap. Our system manages the station's
                  workflow to prioritize your arrival.
                </p>
              </div>

              {/* Visual slot availability badges */}
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-background/20 border border-border/60">
                <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-primary/20 bg-background/40">
                  <span className="text-xs font-semibold text-foreground">Bay 1</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                    Available
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-emerald-500/10 bg-background/40">
                  <span className="text-xs font-semibold text-foreground">Bay 2</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                    Reserved
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-primary font-semibold flex items-center gap-1.5 hover:underline pt-4 cursor-pointer">
              <span>Secure Booking Pipeline</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
