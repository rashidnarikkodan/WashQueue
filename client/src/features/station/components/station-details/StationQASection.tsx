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
      <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
        Community Q&amp;A
      </h2>

      {/* Ask Question Input Box */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="relative">
          <textarea
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder={`Ask a question about ${stationName}...`}
            className="w-full h-24 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-4 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/80 transition-all resize-none"
          />
          <button
            disabled={!questionInput.trim()}
            className="absolute bottom-3 right-3 px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Send size={12} />
            Post Question
          </button>
        </div>
      </div>

      {/* Q&A Thread Box */}
      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border-l-4 border-l-blue-500 border border-slate-800 bg-slate-900/50 space-y-4 shadow-xl"
            >
              <div>
                <h4 className="text-base font-bold text-slate-100">{item.question}</h4>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                  Posted by {item.askedBy} • {item.askedAt}
                </p>
              </div>

              {item.answer && (
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-2 relative">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-black text-[9px] uppercase tracking-widest">
                      Owner
                    </span>
                    <span className="text-xs font-bold text-slate-200">{item.answer.answeredBy}</span>
                    <span className="text-xs text-slate-500">{item.answer.answeredAt}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.answer.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-sm border border-slate-800 rounded-2xl bg-slate-900/60">
          No questions asked yet for this station.
        </div>
      )}
    </div>
  )
}
