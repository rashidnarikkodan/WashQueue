import React from "react"
import { CheckCircle2, Clock, Archive, ChevronDown } from "lucide-react"
import type { KnowledgeDocumentStatus } from "../types/knowledge-docs.types"

interface KnowledgeDocStatusBadgeProps {
  status: KnowledgeDocumentStatus
  className?: string
  editable?: boolean
  onChange?: (status: KnowledgeDocumentStatus) => void
}

export const KnowledgeDocStatusBadge: React.FC<KnowledgeDocStatusBadgeProps> = ({
  status,
  className = "",
  editable = false,
  onChange,
}) => {
  const getStatusConfig = (st: KnowledgeDocumentStatus) => {
    switch (st) {
      case "PUBLISHED":
        return {
          icon: CheckCircle2,
          colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          label: "Published",
        }
      case "DRAFT":
        return {
          icon: Clock,
          colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          label: "Draft",
        }
      case "ARCHIVED":
        return {
          icon: Archive,
          colorClass: "bg-muted text-muted-foreground border-border",
          label: "Archived",
        }
      default:
        return {
          icon: Clock,
          colorClass: "bg-muted text-muted-foreground border-border",
          label: st,
        }
    }
  }

  const { icon: Icon, colorClass, label } = getStatusConfig(status)

  if (editable) {
    return (
      <div className={`relative inline-flex items-center group cursor-pointer ${className}`}>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${colorClass} group-hover:border-primary/50 group-hover:ring-2 group-hover:ring-primary/20`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </span>
        <select
          value={status}
          onChange={(e) => onChange?.(e.target.value as KnowledgeDocumentStatus)}
          aria-label="Select Status"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          <option value="PUBLISHED" className="bg-popover text-popover-foreground">
            Published
          </option>
          <option value="DRAFT" className="bg-popover text-popover-foreground">
            Draft
          </option>
          <option value="ARCHIVED" className="bg-popover text-popover-foreground">
            Archived
          </option>
        </select>
      </div>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

export default KnowledgeDocStatusBadge
