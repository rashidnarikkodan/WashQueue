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

export function AISuggestionChips({ onSelect, disabled = false }: AISuggestionChipsProps) {
  return (
    <div className="w-full mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.prompt)}
              className="group text-left p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card/70 hover:bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-start gap-3 active:scale-[0.99] shadow-xs"
            >
              <div className="p-2 rounded-xl bg-muted text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5 border border-border/40">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.label}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                  {item.prompt}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
