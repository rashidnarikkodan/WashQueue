import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Coins, 
  Clock, 
  Calendar, 
  Activity, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Zap, 
  Smartphone, 
  Globe, 
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32 lg:pb-36 border-b border-border bg-slate-950/20">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/65 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Real-time Car Wash Visibility
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-foreground">
              <span className="text-primary bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Know</span> the Queue,
              <br />
              Before You <span className="text-primary bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Go.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl font-normal leading-relaxed">
              Find nearby wash centers, check live queue status, and save time by planning your visit smarter. No more guessing.
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/95 hover:scale-[1.02] shadow-lg shadow-primary/25 transition-all cursor-pointer"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <a 
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-border bg-card/40 hover:bg-card/85 text-foreground font-medium text-lg transition-colors cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </div>
          
          {/* Hero Visual Map Mockup */}
          <div className="lg:col-span-6 flex justify-center relative w-full">
            <div className="relative w-full max-w-[540px] aspect-square rounded-[2.5rem] border border-border overflow-hidden bg-card/25 shadow-2xl backdrop-blur-sm group">
              
              {/* Map Image Base */}
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/01a09fc6ba4adf8f008ac68deaae8fe39b1ccc50?width=1148"
                alt="Digital navigation map" 
                className="w-full h-full object-cover opacity-60 saturation-50 brightness-75 group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Map overlay gradient grid */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

              {/* Glowing Pulse Rings */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full border border-primary/40 bg-primary/5 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                <div className="absolute w-10 h-10 rounded-full border border-primary/60 bg-primary/20 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
                <div className="w-5 h-5 rounded-full border-4 border-slate-950 bg-primary shadow-lg shadow-primary/80 relative z-10" />
              </div>
              
              {/* Floating Card 1 (Elite Detailing) */}
              <div className="absolute top-[8%] left-[6%] w-[260px] p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 pointer-events-auto">
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <h4 className="text-[11px] font-black tracking-widest text-primary uppercase">ELITE DETAILING</h4>
                    <p className="text-[10px] text-muted-foreground">Downtown Ave</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPEN
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-muted-foreground">Wait Time</span>
                    <span className="text-lg font-bold text-primary">12 <span className="text-xs font-normal text-muted-foreground">min</span></span>
                  </div>
                  
                  {/* Custom progress slider */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '45%' }} />
                  </div>
                  
                  <div className="flex justify-between text-[9px] text-muted-foreground font-medium pt-1">
                    <span>3 Vehicles in Queue</span>
                    <span className="text-primary font-bold">Fast Track Avail.</span>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 (SUV Pro Polish) */}
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

      {/* 2. Features Bento Grid */}
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
              Traditional car washes rely on guesswork. We use a high-frequency polling engine to ensure you know exactly when your vehicle will be serviced.
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
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">Real-Time Queue Tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our live telemetry feeds update every 2 seconds, providing a granular view of every bay's status across the entire network.
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
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Vehicle-Aware Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Dynamic pricing that adapts to your vehicle's size and service requirements instantly.
                </p>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pt-2">No Hidden Fees</span>
            </div>
            
            {/* Box 3: Smart Estimation (Small) */}
            <div className="md:col-span-4 p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm flex flex-col justify-between hover:border-primary/45 transition-colors duration-300">
              <div className="space-y-4">
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Smart Estimation</h3>
                <p className="text-sm text-muted-foreground">
                  ML-powered wait times that account for historical traffic patterns and staff availability.
                </p>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pt-2">Predictive Logic</span>
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
                    Lock in your time slot with a single tap. Our system manages the provider's workflow to prioritize your arrival.
                  </p>
                </div>
                
                {/* Visual slot availability badges */}
                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/20 border border-border/60">
                  <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-primary/20 bg-slate-950/40">
                    <span className="text-xs font-semibold text-foreground">Bay 1</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                      Available
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-emerald-500/10 bg-slate-950/40">
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

      {/* 3. How It Works (Step Flow) */}
      <section id="how-it-works" className="py-24 border-b border-border bg-slate-950/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Section Headers */}
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              The Frictionless Journey
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
              From driveway to detailed in five simple steps.
            </p>
          </div>
          
          {/* Steps Timeline Wrapper */}
          <div className="relative">
            {/* Connector Line (Desktop Only) */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4 group">
                <div className="w-16 h-16 rounded-full border border-primary/30 bg-card flex items-center justify-center font-bold text-xl text-primary shadow-md group-hover:scale-105 group-hover:border-primary transition-all duration-300">
                  1
                </div>
                <h3 className="font-bold text-foreground text-base">Search</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  Locate nearest premium providers via Geo-Search.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4 group">
                <div className="w-16 h-16 rounded-full border border-primary/30 bg-card flex items-center justify-center font-bold text-xl text-primary shadow-md group-hover:scale-105 group-hover:border-primary transition-all duration-300">
                  2
                </div>
                <h3 className="font-bold text-foreground text-base">Vehicle Specs</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  Enter make & model for precise quote generation.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4 group">
                <div className="w-16 h-16 rounded-full border border-primary/30 bg-card flex items-center justify-center font-bold text-xl text-primary shadow-md group-hover:scale-105 group-hover:border-primary transition-all duration-300">
                  3
                </div>
                <h3 className="font-bold text-foreground text-base">View Queue</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  Monitor live bay status and estimated start times.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center space-y-4 group">
                <div className="w-16 h-16 rounded-full border border-primary/30 bg-card flex items-center justify-center font-bold text-xl text-primary shadow-md group-hover:scale-105 group-hover:border-primary transition-all duration-300">
                  4
                </div>
                <h3 className="font-bold text-foreground text-base">Instant Book</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  Secure your slot with encrypted one-tap payment.
                </p>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center space-y-4 group">
                <div className="w-16 h-16 rounded-full border border-primary/30 bg-card flex items-center justify-center font-bold text-xl text-primary shadow-md group-hover:scale-105 group-hover:border-primary transition-all duration-300">
                  5
                </div>
                <h3 className="font-bold text-foreground text-base">Real-Time Updates</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  Get notified when your bay is ready for entry.
                </p>
              </div>

            </div>
          </div>
          
        </div>
      </section>

      {/* 4. Product Preview (UI Split) */}
      <section className="py-24 border-b border-border bg-slate-950/20">
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
            <div className="p-5 rounded-2xl bg-slate-950/40 border border-border/50 mb-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-foreground text-sm sm:text-base">South Bay Detailing</h4>
                <span className="font-bold text-primary text-sm sm:text-base">$38.00</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Queue Length indicator */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">QUEUE LENGTH</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-6 rounded-sm bg-primary" />
                    <span className="w-1.5 h-6 rounded-sm bg-primary" />
                    <span className="w-1.5 h-6 rounded-sm bg-slate-800" />
                    <span className="w-1.5 h-6 rounded-sm bg-slate-800" />
                  </div>
                </div>
                {/* Wait time */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">WAIT TIME</span>
                  <span className="text-base font-extrabold text-emerald-400 block">~ 8 Min</span>
                </div>
              </div>
            </div>
            
            {/* Queue Status UI */}
            <div className="p-5 rounded-2xl bg-slate-950/40 border border-border/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">Tesla Model 3 • Deep Polish</p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5 relative">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '65%' }} />
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
              Our interface is designed to provide maximum information density without the clutter. From pricing transparency to live wash progress, every interaction is built for the premium vehicle owner.
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

      {/* 5. Advanced Capabilities (Tech Grid) */}
      <section className="py-24 border-b border-border bg-slate-950/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="p-8 md:p-12 rounded-[2.5rem] border border-border bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Tech details */}
              <div className="flex flex-col items-start text-left space-y-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  The Tech Stack Behind the Stream.
                </h2>
                
                <div className="space-y-6">
                  {/* Tech Item 1 */}
                  <div className="flex gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 h-fit">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg">Redis-Based Queue Engine</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sub-millisecond queue priority handling using low-latency in-memory data structures.
                      </p>
                    </div>
                  </div>
                  {/* Tech Item 2 */}
                  <div className="flex gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 h-fit">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg">Socket.io Bi-Directional Updates</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Instant state synchronization between detailing bays and user dashboards without polling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                
                <div className="p-6 rounded-2xl border border-border bg-slate-950/40 hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary block">42ms</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-2">
                    UPDATE LATENCY
                  </span>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-slate-950/40 hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary block">12k+</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-2">
                    ACTIVE NODES
                  </span>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-slate-950/40 hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary block">99.9%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-2">
                    UPTIME SLA
                  </span>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-slate-950/40 hover:-translate-y-1 transition-transform duration-300">
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

      {/* 6. CTA Block */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-6">
        <div className="p-8 sm:p-16 rounded-[2.5rem] bg-gradient-to-tr from-sky-400 to-blue-600 dark:from-primary/95 dark:to-blue-600 text-white shadow-2xl relative overflow-hidden text-center flex flex-col items-center space-y-6">
          
          {/* Decorative glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-950/20 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight max-w-2xl leading-none">
            Stop Waiting in Line.
            <br />
            Start Booking Smart.
          </h2>
          
          <p className="text-base sm:text-lg opacity-90 max-w-xl font-medium leading-relaxed">
            Join thousands of premium car owners who have reclaimed their time with the WashQueue network.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <button 
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-900 transition-colors shadow-lg cursor-pointer"
            >
              <Smartphone className="mr-2 h-5 w-5" />
              Download for iOS
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
            >
              <Globe className="mr-2 h-5 w-5" />
              Get Access for Web
            </button>
          </div>
          
        </div>
      </section>

    </div>
  );
}
