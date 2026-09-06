import React from "react"
import { Lock } from "lucide-react"

interface FeatureLockProps {
  children: React.ReactNode
  message?: string
  isLocked?: boolean
}

export default function FeatureLock({
  children,
  message = "Coming Soon",
  isLocked = true,
}: FeatureLockProps) {
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl">
      <div className="pointer-events-none select-none opacity-90 h-full w-full">{children}</div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-background/45 backdrop-blur-[6px] rounded-3xl border border-transparent">
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-11 h-11 rounded-full bg-slate-900 border border-border flex items-center justify-center text-muted-foreground shadow-xl shadow-black/80 scale-100 transition-all duration-300">
            <Lock size={15} className="stroke-[2.5] text-[#ADC6FF]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ADC6FF]">
              {message}
            </p>
            <p className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase">
              Future Release
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
