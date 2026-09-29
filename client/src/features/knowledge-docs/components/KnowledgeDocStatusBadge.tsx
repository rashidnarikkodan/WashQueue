import React from "react"
import { CheckCircle2, Clock, Archive } from "lucide-react"
import type { KnowledgeDocumentStatus } from "../types/knowledge-docs.types"

interface KnowledgeDocStatusBadgeProps {
  status: KnowledgeDocumentStatus
  className?: string
}

export const KnowledgeDocStatusBadge: React.FC<KnowledgeDocStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  switch (status) {
    case "PUBLISHED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Published
        </span>
      )
    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Draft
        </span>
      )
    case "ARCHIVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border ${className}`}
        >
          <Archive className="w-3.5 h-3.5" />
          Archived
        </span>
      )
    default:
      return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-muted ${className}`}>
          {status}
        </span>
      )
  }
}

export default KnowledgeDocStatusBadge
