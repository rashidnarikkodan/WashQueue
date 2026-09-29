import React from "react"
import { Bot, Sparkles, Database, Zap, Cpu } from "lucide-react"

export const AIEmptyHero: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-6 sm:pt-10 pb-6 px-4">
      {/* Icon Badge */}
      <div className="relative mb-6">
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 rounded-3xl blur-xl opacity-75 animate-pulse" />
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-primary shadow-xl">
          <Bot className="w-10 h-10 sm:w-11 sm:h-11" />
          <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-primary text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
        <Sparkles className="w-3 h-3" />
        RAG Powered Station Intelligence
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
        How can I help you with{" "}
        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-primary bg-clip-text text-transparent">
          WashQueue today?
        </span>
      </h1>

      <p className="mt-3.5 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
        Ask anything about booking queues, service tiers, station bay availability, cancellations,
        or wallet payments. Powered by semantic vector search and local LLM inference.
      </p>

      {/* Capability Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card/80 border border-border/80 text-xs font-medium text-muted-foreground shadow-xs">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>Vector RAG Search</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card/80 border border-border/80 text-xs font-medium text-muted-foreground shadow-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          <span>Local Ollama LLM</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card/80 border border-border/80 text-xs font-medium text-muted-foreground shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Queue Context</span>
        </div>
      </div>
    </div>
  )
}
