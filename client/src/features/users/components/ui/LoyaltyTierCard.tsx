import { Award } from "lucide-react";
import FeatureLock from "../../../../shared/components/ui/FeatureLock";

export default function LoyaltyTierCard() {
  return (
    <FeatureLock message="Loyalty Tier">
      <div className="border border-border bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-6 h-full relative overflow-hidden text-left">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-[#ADC6FF]" />
          <h2 className="text-base font-black uppercase text-foreground tracking-widest">
            User Loyalty Tier
          </h2>
        </div>

        <div className="flex flex-col items-center text-center space-y-3.5 py-4">
          <div className="w-16 h-16 rounded-full bg-muted text-primary border border-primary/35 flex items-center justify-center shadow-lg shadow-primary/5">
            <Award size={28} className="stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground">Bronze Tier</h3>
            <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
              Initial Member Status
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/40">
          <div className="flex justify-between items-end text-xs">
            <span className="text-muted-foreground font-medium">Lifeline Spend</span>
            <span className="font-black text-foreground text-sm">$0.00</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full shadow-primary/60 transition-all duration-500"
              style={{ width: "0%" }}
            />
          </div>

          <p className="text-[10px] text-muted-foreground font-semibold text-center italic mt-1.5">
            No loyalty progress accumulated.
          </p>
        </div>
      </div>
    </FeatureLock>
  );
}
