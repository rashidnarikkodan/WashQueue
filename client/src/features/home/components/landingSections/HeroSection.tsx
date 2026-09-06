import { useNavigate } from "react-router-dom"
import { Zap, ArrowRight } from "lucide-react"

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32 lg:pb-36 border-b border-border bg-background/20">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-6 flex flex-col items-start space-y-6 text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live Queue Dispatch Engine v4
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.05]">
            The Live Queue
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              For Premium Detailing
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-lg">
            Say goodbye to waiting in lines. Track telemetry-updated wash wait times, manage your
            digital garage, and secure instant queue bookings.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm hover:bg-primary/95 transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 cursor-pointer w-full sm:w-auto"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-border bg-card/45 hover:bg-card/90 text-foreground font-bold text-sm transition-all cursor-pointer w-full sm:w-auto"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-[480px] h-[340px] rounded-[2.5rem] border border-border bg-gradient-to-br from-slate-900/60 to-slate-950/60 shadow-2xl overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M 0,50 L 100,50 M 50,0 L 50,100"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="0.25"
                  fill="none"
                />
              </svg>
            </div>

            <div className="absolute top-[12%] left-[8%] w-[250px] p-5 rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 pointer-events-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Bay 3 active
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-muted-foreground">Wait Time</span>
                  <span className="text-lg font-bold text-primary">
                    12 <span className="text-xs font-normal text-muted-foreground">min</span>
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                </div>

                <div className="flex justify-between text-[9px] text-muted-foreground font-medium pt-1">
                  <span>3 Vehicles in Queue</span>
                  <span className="text-primary font-bold">Fast Track Avail.</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[8%] right-[6%] w-[220px] p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 pointer-events-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">SUV Pro Polish</h4>
                  <p className="text-[10px] text-muted-foreground">Estimated: $45.00</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-[11px] hover:bg-primary/95 transition-all shadow-md cursor-pointer"
              >
                Confirm Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
