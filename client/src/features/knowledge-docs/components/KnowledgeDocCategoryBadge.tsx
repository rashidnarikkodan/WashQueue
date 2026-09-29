import React from "react"
import {
  HelpCircle,
  ShieldAlert,
  Sparkles,
  CalendarCheck,
  CreditCard,
  Layers,
  LifeBuoy,
  ChevronDown,
} from "lucide-react"
import type { KnowledgeDocumentCategory } from "../types/knowledge-docs.types"
import { KNOWLEDGE_DOC_CATEGORIES } from "../constants/knowledge-doc-categories.const"

interface KnowledgeDocCategoryBadgeProps {
  category: KnowledgeDocumentCategory
  className?: string
  editable?: boolean
  onChange?: (category: KnowledgeDocumentCategory) => void
}

export const KnowledgeDocCategoryBadge: React.FC<KnowledgeDocCategoryBadgeProps> = ({
  category,
  className = "",
  editable = false,
  onChange,
}) => {
  const getCategoryConfig = (cat: KnowledgeDocumentCategory) => {
    switch (cat) {
      case "FAQ":
        return {
          icon: HelpCircle,
          colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          label: "FAQ",
        }
      case "POLICY":
        return {
          icon: ShieldAlert,
          colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
          label: "Policy",
        }
      case "SERVICE":
        return {
          icon: Sparkles,
          colorClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
          label: "Service",
        }
      case "BOOKING":
        return {
          icon: CalendarCheck,
          colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          label: "Booking",
        }
      case "PAYMENT":
        return {
          icon: CreditCard,
          colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          label: "Payment",
        }
      case "QUEUE":
        return {
          icon: Layers,
          colorClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
          label: "Queue",
        }
      case "SUPPORT":
        return {
          icon: LifeBuoy,
          colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
          label: "Support",
        }
      default:
        return {
          icon: Sparkles,
          colorClass: "bg-muted text-muted-foreground border-border",
          label: cat,
        }
    }
  }

  const { icon: Icon, colorClass, label } = getCategoryConfig(category)

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
          value={category}
          onChange={(e) => onChange?.(e.target.value as KnowledgeDocumentCategory)}
          aria-label="Select Category"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {KNOWLEDGE_DOC_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-popover text-popover-foreground">
              {cat}
            </option>
          ))}
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

export default KnowledgeDocCategoryBadge
