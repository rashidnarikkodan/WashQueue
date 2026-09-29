import React from "react"
import {
  HelpCircle,
  ShieldAlert,
  Sparkles,
  CalendarCheck,
  CreditCard,
  Layers,
  LifeBuoy,
} from "lucide-react"
import type { KnowledgeDocumentCategory } from "../types/knowledge-docs.types"

interface KnowledgeDocCategoryBadgeProps {
  category: KnowledgeDocumentCategory
  className?: string
}

export const KnowledgeDocCategoryBadge: React.FC<KnowledgeDocCategoryBadgeProps> = ({
  category,
  className = "",
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
