import React from "react"
import { Sparkles, Clock, ShieldAlert, CarFront } from "lucide-react"

const SUGGESTIONS = [
  {
    icon: CarFront,
    label: "What packages and detailing tiers are available?",
    prompt:
      "What car wash service packages and detailing tiers are available at WashQueue stations?",
  },
  {
    icon: Clock,
    label: "How do live queue wait times work?",
    prompt: "How does the real-time queue estimation and active bay tracking work for customers?",
  },
  {
    icon: Sparkles,
    label: "Can I drive in without booking in advance?",
    prompt:
      "Can station managers admit walk-in customers without a prior booking, and how does it affect the queue?",
  },
  {
    icon: ShieldAlert,
    label: "What is the cancellation & refund policy?",
    prompt: "What is the cancellation and refund policy for car wash reservations?",
  },
]

interface AISuggestionChipsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export const AISuggestionChips: React.FC<AISuggestionChipsProps> = ({
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.prompt)}
              className="text-left px-3.5 py-2.5 rounded-xl bg-card/60 hover:bg-card border border-border/70 hover:border-primary/40 shadow-xs hover:shadow-sm transition-all duration-150 flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span className="text-xs sm:text-sm text-foreground/80 group-hover:text-foreground line-clamp-1">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
