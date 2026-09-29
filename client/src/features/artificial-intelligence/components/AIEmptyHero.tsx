import React from "react"
import { Sparkles } from "lucide-react"

export const AIEmptyHero: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-1 px-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20 shadow-xs">
        <Sparkles className="w-6 h-6" />
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
        How can we help you today?
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
        Ask about service packages, live queue wait times, station locations, or booking policies.
      </p>
    </div>
  )
}
