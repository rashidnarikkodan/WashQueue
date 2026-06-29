import { useAuthStore } from "../../auth/store/authStore";
import { 
  Check, 
  Clock, 
  Droplets, 
  Wind, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  Thermometer, 
  TrendingUp, 
  Gauge, 
  ArrowRight
} from "lucide-react";
import { MOCK_DASHBOARD_DATA } from "../mock/dashboard.mock";

export default function Home() {
  const { user } = useAuthStore();
  const data = MOCK_DASHBOARD_DATA;

  // Use either the real user wallet balance or mock
  const walletBalance = user?.walletBalance !== undefined ? `$${user.walletBalance.toFixed(2)}` : data.wallet.balance;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="space-y-2 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
            {data.user.greeting}, <span className="text-primary">{user?.name || data.user.name}</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 font-medium">
            Ready for a fresh wash today?
          </p>
        </div>

        {/* Core Layout: Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Column: Active Booking Panel (8 Cols) */}
          <div className="lg:col-span-8 bg-[#191F31] border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[412px] animate-in slide-in-from-left duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    LIVE STATUS: {data.activeBooking.status}
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Booking ID: {data.activeBooking.id}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  Queue Position {data.activeBooking.queuePosition}
                </h2>
                
                <p className="text-sm md:text-base text-slate-300 max-w-xl">
                  Estimated wait time: <span className="text-[#ADC6FF] font-bold">{data.activeBooking.estimatedWait}</span>. We'll notify you when <span className="font-bold text-white">{data.activeBooking.bayInfo}</span> is ready for your <span className="font-bold text-white">{data.activeBooking.vehicleName}</span>.
                </p>
              </div>
              
              <button className="flex items-center gap-2.5 px-6 py-4.5 rounded-2xl bg-[#ADC6FF] text-[#002E6A] font-extrabold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-[#ADC6FF]/10 cursor-pointer self-start shrink-0">
                <span>Track Booking</span>
                <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
              </button>
            </div>
            
            {/* Progress Tracker Component */}
            <div className="relative pt-6">
              {/* Connector Lines */}
              <div className="absolute top-[36px] left-[32px] right-[32px] h-[3px] bg-slate-700/80 -z-10 rounded-full" />
              <div className="absolute top-[36px] left-[32px] w-[25%] h-[3px] bg-[#ADC6FF] shadow-[0_0_12px_rgba(173,198,255,0.6)] -z-10 rounded-full" />

              <div className="flex justify-between items-start">
                {data.activeBooking.steps.map((step, idx) => {
                  const isCompleted = step.status === "completed";
                  const isCurrent = step.status === "current";
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-3 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#191F31] shadow-md transition-all duration-300 ${
                        isCompleted 
                          ? "bg-[#ADC6FF] text-[#002E6A]" 
                          : isCurrent 
                            ? "bg-[#ADC6FF] text-[#002E6A] scale-110 ring-4 ring-[#ADC6FF]/20" 
                            : "bg-[#2E3447] text-slate-400"
                      }`}>
                        {idx === 0 && <Check className="h-4.5 w-4.5 stroke-[3]" />}
                        {idx === 1 && <Clock className="h-4.5 w-4.5 stroke-[2.5]" />}
                        {idx === 2 && <Droplets className="h-4.5 w-4.5 stroke-[2.5]" />}
                        {idx === 3 && <Wind className="h-4.5 w-4.5 stroke-[2.5]" />}
                        {idx === 4 && <CheckCircle2 className="h-4.5 w-4.5 stroke-[2.5]" />}
                      </div>
                      
                      <span className={`text-xs md:text-sm font-bold tracking-tight transition-colors ${
                        isCompleted || isCurrent ? "text-white" : "text-slate-400"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Right Column: Queue Intelligence & Weather Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-right duration-500">
            {/* Queue Intelligence Card */}
            <div className="bg-[#23293C] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Queue Intelligence
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#191F31] p-3.5 rounded-2xl border border-slate-800/30">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-primary border border-slate-800/80 shadow-md">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Average Wait</p>
                    <p className="text-base font-black text-white">{data.queueIntelligence.averageWait}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#191F31] p-3.5 rounded-2xl border border-slate-800/30">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-emerald-400 border border-slate-800/80 shadow-md">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Wash Speed</p>
                    <p className="text-base font-black text-white">{data.queueIntelligence.washSpeed}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Insights Card */}
            <div className="bg-[#23293C] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="text-amber-400">
                    <Thermometer className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Weather Insights</h4>
                </div>
                <span className="text-lg font-black text-white">{data.weatherInsights.temperature}</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-black text-[#ADC6FF] uppercase tracking-widest">
                  {data.weatherInsights.alertTitle}
                </p>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                  {data.weatherInsights.alertDetails}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Digital Garage Section */}
        <section className="mb-12 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">Digital Garage</h2>
              <p className="text-sm text-slate-400 font-medium">Manage your registered premium vehicles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.garage.map((vehicle) => {
              const isOverdue = vehicle.status === "overdue";
              
              return (
                <div key={vehicle.id} className="bg-[#070D1F] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-slate-700/80 transition-all duration-300">
                  {/* Image and status badge */}
                  <div className="h-56 relative overflow-hidden">
                    <img 
                      src={vehicle.image} 
                      alt={`${vehicle.brand} ${vehicle.model}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1F] to-transparent opacity-60" />
                    
                    <span className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                      isOverdue 
                        ? "bg-rose-500/25 text-rose-400 border border-rose-500/25" 
                        : "bg-emerald-500/25 text-emerald-400 border border-emerald-500/25"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? "bg-rose-400" : "bg-emerald-400"}`} />
                      {vehicle.statusText}
                    </span>
                    
                    {vehicle.isPrimary && (
                      <span className="absolute top-4 right-4 bg-primary/10 text-primary border border-primary/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md">
                        PRIMARY
                      </span>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Brand & Plate */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-extrabold text-white">{vehicle.brand} {vehicle.model}</h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5 tracking-wider">{vehicle.plate}</p>
                        </div>
                        <div className="flex gap-2">
                          {vehicle.typeBadges.map((badge, bIdx) => (
                            <span key={bIdx} className="bg-slate-800/80 text-slate-300 text-[9px] font-black px-2 py-1 rounded-md tracking-wider">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Technical Specs Details Grid */}
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-slate-800/60 pt-4">
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Model Year</span>
                          <span className="text-sm font-bold text-slate-200">{vehicle.modelYear}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Last Wash</span>
                          <span className="text-sm font-bold text-slate-200">{vehicle.lastWash}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Next Wash</span>
                          <span className={`text-sm font-bold ${isOverdue ? "text-rose-400" : "text-emerald-400"}`}>
                            {vehicle.nextWash}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Usage</span>
                          <span className="text-sm font-bold text-slate-200">{vehicle.usage}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Buttons */}
                    <div className="flex gap-3 pt-6">
                      <button className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-extrabold text-xs tracking-wider transition-all cursor-pointer">
                        View Details
                      </button>
                      <button className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10">
                        Book Wash
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Actions Add Card */}
            <div className="border-2 border-dashed border-slate-800/80 hover:border-primary/40 rounded-3xl p-6 flex flex-col justify-center items-center text-center gap-4 transition-all duration-300 min-h-[480px]">
              <div className="w-16 h-16 rounded-full bg-slate-800/40 flex items-center justify-center border border-slate-800 text-slate-400">
                <Plus size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Add New Vehicle</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium">
                  Register new premium cars or SUVs into your digital garage for customized wait alerts and detailing quotes.
                </p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-extrabold text-xs tracking-wider transition-all cursor-pointer">
                Register Vehicle
              </button>
            </div>
          </div>
        </section>

        {/* Wallet & Loyalty Rewards Support Grid */}
        <section className="bg-[#23293C] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* Balance panel */}
            <div className="md:col-span-4 flex flex-col justify-between space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Portfolio Balance
                </span>
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none block">
                  {walletBalance}
                </span>
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-md">
                  Add Funds
                </button>
                <button className="flex-1 py-3 px-5 rounded-2xl border border-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wider transition-all cursor-pointer">
                  Withdraw
                </button>
              </div>
            </div>

            {/* vertical dividing line */}
            <div className="hidden md:block md:col-span-1 py-2 justify-self-center">
              <div className="w-[1px] h-full bg-slate-800/60" />
            </div>

            {/* Loyalty points details */}
            <div className="md:col-span-4 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Loyalty Points
                    </span>
                    <span className="text-xl font-extrabold text-white">
                      {data.wallet.loyaltyPoints}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {data.wallet.tierProgress}% to Platinum
                  </span>
                </div>
                
                {/* Custom Gradient Progress Bar */}
                <div className="h-3.5 bg-slate-800 rounded-full overflow-hidden relative border border-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-[#ADC6FF]"
                    style={{ width: `${data.wallet.tierProgress}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                {data.wallet.rewardDetails}
              </p>
            </div>

            {/* vertical dividing line */}
            <div className="hidden md:block md:col-span-1 py-2 justify-self-center">
              <div className="w-[1px] h-full bg-slate-800/60" />
            </div>

            {/* Support section */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Quick Support
              </span>
              
              <div className="space-y-3 flex-grow flex flex-col justify-center">
                <a 
                  href="/help" 
                  className="flex justify-between items-center p-3 rounded-2xl bg-[#191F31]/50 border border-slate-800/50 hover:bg-[#191F31] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={16} className="text-slate-400" />
                    <span className="text-xs md:text-sm font-bold text-white">Help Center</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </a>

                <a 
                  href="/chat" 
                  className="flex justify-between items-center p-3 rounded-2xl bg-[#191F31]/50 border border-slate-800/50 hover:bg-[#191F31] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-slate-400" />
                    <span className="text-xs md:text-sm font-bold text-white">Live Agent</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </a>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
