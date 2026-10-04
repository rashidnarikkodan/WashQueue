import React from "react"
import { CheckCircle2, Clock, Archive } from "lucide-react"
import type { KnowledgeDocumentStatus } from "../types/knowledge-docs.types"
import SelectInput from "@/shared/components/form/SelectInput"

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
    const statuses: KnowledgeDocumentStatus[] = ["PUBLISHED", "DRAFT", "ARCHIVED"]
    return (
      <SelectInput
        value={status}
        onChange={(val) => onChange?.(val as KnowledgeDocumentStatus)}
        options={statuses.map((st) => {
          const cfg = getStatusConfig(st)
          const StIcon = cfg.icon
          return {
            label: cfg.label,
            value: st,
            icon: <StIcon className="w-3.5 h-3.5" />,
          }
        })}
        className={`w-36 ${className}`}
      />
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
