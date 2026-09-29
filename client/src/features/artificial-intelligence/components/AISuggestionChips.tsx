import React from "react"
import { CarFront, Clock, Sparkles, ShieldAlert } from "lucide-react"

const SUGGESTIONS = [
  {
    icon: CarFront,
    label: "What packages are available?",
    prompt:
      "What car wash service packages and detailing tiers are available at WashQueue stations?",
  },
  {
    icon: Clock,
    label: "How do live wait times work?",
    prompt: "How does the real-time queue estimation and active bay tracking work for customers?",
  },
  {
    icon: Sparkles,
    label: "Can I drive in without booking?",
    prompt:
      "Can station managers admit walk-in customers without a prior booking, and how does it affect the queue?",
  },
  {
    icon: ShieldAlert,
    label: "What's the cancellation policy?",
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
    <div className="w-full mt-4">
      <div className="grid grid-cols-2 gap-2">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.prompt)}
              className="group text-left px-3.5 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary mb-2 transition-colors duration-150" />
              <p className="text-xs sm:text-[13px] font-medium text-foreground/70 group-hover:text-foreground leading-snug transition-colors duration-150">
                {item.label}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
