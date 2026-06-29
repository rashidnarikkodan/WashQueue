export default function HowItWorksSection() {
  return (
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
  );
}
