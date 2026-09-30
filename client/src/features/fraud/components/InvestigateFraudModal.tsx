import React, { useState } from "react"
import { X, ShieldAlert } from "lucide-react"
import { RiskLevelBadge, FraudStatusBadge, ActorRoleBadge } from "./FraudBadges"
import type { FraudEventDto } from "../types/fraud.types"

interface InvestigateFraudModalProps {
  event: FraudEventDto | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (
    id: string,
    action: "REVIEW" | "RESOLVE" | "DISMISS",
    notes?: string
  ) => Promise<void>
}

export const InvestigateFraudModal: React.FC<InvestigateFraudModalProps> = ({
  event,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !event) return null

  const eventId = event.id || event._id || ""

  const handleAction = async (action: "REVIEW" | "RESOLVE" | "DISMISS") => {
    setIsSubmitting(true)
    try {
      await onUpdateStatus(eventId, action, notes)
      setNotes("")
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Fraud Investigation</h2>
              <p className="text-xs text-muted-foreground">Audit ID: {eventId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border/50 bg-background/50">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Risk Score
              </span>
              <p className="text-xl font-bold text-rose-400 mt-0.5">{event.riskScore} / 100</p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Severity
              </span>
              <div className="mt-1">
                <RiskLevelBadge level={event.riskLevel} />
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Status
              </span>
              <div className="mt-1">
                <FraudStatusBadge status={event.status} />
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Actor Role
              </span>
              <div className="mt-1">
                <ActorRoleBadge role={event.actorType} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Target Context
            </span>
            <div className="p-3.5 rounded-xl border border-border/50 bg-background/40 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <p className="font-medium text-foreground">{event.userId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Entity:</span>
                <p className="font-medium text-foreground">
                  {event.entityType} #{event.entityId}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Event Type:</span>
                <p className="font-medium text-foreground">{event.eventType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Detected At:</span>
                <p className="font-medium text-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Triggered Signals ({event.signals.length})
            </span>
            <div className="space-y-2">
              {event.signals.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground tracking-wide">
                      {sig.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      +{sig.score} pts
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sig.description}</p>
                  {sig.metadata && Object.keys(sig.metadata).length > 0 && (
                    <div className="text-[11px] font-mono text-muted-foreground/80 bg-background/60 p-2 rounded border border-border/40 mt-1">
                      {JSON.stringify(sig.metadata, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Resolution Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add administrative notes regarding this investigation or action taken..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 px-6 border-t border-border/60 bg-muted/10 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction("REVIEW")}
              disabled={isSubmitting || event.status === "REVIEWING"}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Mark in Review
            </button>
            <button
              onClick={() => handleAction("DISMISS")}
              disabled={isSubmitting || event.status === "DISMISSED"}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Dismiss (False Positive)
            </button>
          </div>

          <button
            onClick={() => handleAction("RESOLVE")}
            disabled={isSubmitting || event.status === "RESOLVED"}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            Resolve & Flag
          </button>
        </div>
      </div>
    </div>
  )
}
