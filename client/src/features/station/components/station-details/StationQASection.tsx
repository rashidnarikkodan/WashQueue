import { useState } from "react"
import { Send } from "lucide-react"

interface QAItem {
  id: string
  question: string
  askedBy: string
  askedAt: string
  answer?: {
    answeredBy: string
    answeredAt: string
    text: string
  }
}

interface StationQASectionProps {
  stationName: string
  questions?: QAItem[]
}

export function StationQASection({ stationName, questions = [] }: StationQASectionProps) {
  const [questionInput, setQuestionInput] = useState("")

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight">Community Q&amp;A</h2>

      <div className="p-6 rounded-2xl border border-border bg-card/90 shadow-xl space-y-4">
        <div className="relative">
          <textarea
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder={`Ask a question about ${stationName}...`}
            className="w-full h-24 bg-background text-foreground border border-border rounded-xl p-4 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all resize-none"
          />
          <button
            disabled={!questionInput.trim()}
            className="absolute bottom-3 right-3 px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-1.5"
          >
            <Send size={12} />
            Post Question
          </button>
        </div>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border-l-4 border-l-primary border border-border bg-card/50 space-y-4 shadow-xl"
            >
              <div>
                <h4 className="text-base font-bold text-foreground">{item.question}</h4>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                  Posted by {item.askedBy} • {item.askedAt}
                </p>
              </div>

              {item.answer && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-2 relative">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full border border-success/30 bg-success/20 text-success font-black text-[9px] uppercase tracking-widest">
                      Owner
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {item.answer.answeredBy}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.answer.answeredAt}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.answer.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground text-sm border border-border rounded-2xl bg-card/60">
          No questions asked yet for this station.
        </div>
      )}
    </div>
  )
}
