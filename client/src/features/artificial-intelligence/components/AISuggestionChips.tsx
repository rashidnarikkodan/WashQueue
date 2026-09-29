import React from "react"
import { Sparkles, Clock, ShieldAlert, CarFront } from "lucide-react"
import type { PromptSuggestion } from "../types/ai.types"

const DEFAULT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: "services",
    title: "Car Wash Packages",
    description: "Explore Express Wash, Deluxe Interior Detailing & Ceramic Coating",
    prompt:
      "What car wash service packages and detailing tiers are available at WashQueue stations?",
    category: "service",
  },
  {
    id: "queue",
    title: "Live Queue & Wait Times",
    description: "Learn how real-time queue tracking & bay management works",
    prompt: "How does the real-time queue estimation and active bay tracking work for customers?",
    category: "queue",
  },
  {
    id: "walkins",
    title: "Walk-in Customers",
    description: "Can I get a service without booking in advance?",
    prompt:
      "Can station managers admit walk-in customers without a prior booking, and how does it affect the queue?",
    category: "walkin",
  },
  {
    id: "policy",
    title: "Cancellations & Refunds",
    description: "Review appointment cancellation rules and wallet refunds",
    prompt: "What is the cancellation and refund policy for car wash reservations?",
    category: "policy",
  },
]

const CATEGORY_ICONS = {
  service: CarFront,
  queue: Clock,
  walkin: Sparkles,
  policy: ShieldAlert,
}

interface AISuggestionChipsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export const AISuggestionChips: React.FC<AISuggestionChipsProps> = ({
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Suggested Inquiries
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFAULT_SUGGESTIONS.map((item) => {
          const Icon = CATEGORY_ICONS[item.category]
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.prompt)}
              className="group text-left p-4 rounded-2xl bg-card/70 hover:bg-card border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-3.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200 shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
