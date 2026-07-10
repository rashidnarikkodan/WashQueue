import { Check, Clock, Droplets, Wind, CheckCircle2, ArrowRight } from "lucide-react";
import { MOCK_DASHBOARD_DATA } from "../../mock/dashboard.mock";

export default function ActiveBookingSection() {
  const data = MOCK_DASHBOARD_DATA;

  return (
    <div className="lg:col-span-8 bg-card border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[412px] animate-in slide-in-from-left duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 text-left">
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
            Estimated wait time: <span className="text-primary font-bold">{data.activeBooking.estimatedWait}</span>. We'll notify you when <span className="font-bold text-white">{data.activeBooking.bayInfo}</span> is ready for your <span className="font-bold text-white">{data.activeBooking.vehicleName}</span>.
          </p>
        </div>
        
        <button className="flex items-center gap-2.5 px-6 py-4.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/10 cursor-pointer self-start shrink-0">
          <span>Track Booking</span>
          <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
        </button>
      </div>
      
      {/* Progress Tracker Component */}
      <div className="relative pt-6">
        {/* Connector Lines */}
        <div className="absolute top-[36px] left-[32px] right-[32px] h-[3px] bg-slate-700/80 -z-10 rounded-full" />
        <div className="absolute top-[36px] left-[32px] w-[25%] h-[3px] bg-primary shadow-primary/60 -z-10 rounded-full" />

        <div className="flex justify-between items-start">
          {data.activeBooking.steps.map((step, idx) => {
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";
            
            return (
              <div key={idx} className="flex flex-col items-center gap-3 text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-card shadow-md transition-all duration-300 ${
                  isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : isCurrent 
                      ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20" 
                      : "bg-muted text-slate-400"
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
  );
}
