import React from "react"
import { Sparkles } from "lucide-react"

export const AIEmptyHero: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto pt-8 pb-4 px-4">
      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 border border-primary/20 shadow-xs">
        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
        How can we help you today?
      </h1>

      <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
        Ask about service packages, live queue wait times, station locations, or booking policies.
      </p>
    </div>
  )
}
