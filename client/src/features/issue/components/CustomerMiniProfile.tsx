import { User } from "lucide-react"
import type { CustomerDetailsSnapshot } from "../types/issue.types"
import { getInitials } from "@/shared/utils/avatar"

interface CustomerMiniProfileProps {
  customer?: CustomerDetailsSnapshot
}

export default function CustomerMiniProfile({ customer }: CustomerMiniProfileProps) {
  const name = customer?.name || "Customer"
  const membership = customer?.membershipTier || "Member Since 2023"
  const totalWashes = customer?.totalWashes ?? 12
  const priorIssues = customer?.priorIssuesCount ?? 0

  return (
    <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4 text-left">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full border border-border overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
          {customer?.avatar ? (
            <img src={customer.avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials(name) || <User className="w-5 h-5" />}</span>
          )}
        </div>

        <div className="space-y-0.5 min-w-0">
          <h4 className="text-sm font-bold text-foreground truncate">{name}</h4>
          <p className="text-[11px] text-muted-foreground truncate">{membership}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
            TOTAL WASHES
          </span>
          <span className="text-xl font-black text-foreground">{totalWashes}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
            PRIOR ISSUES
          </span>
          <span className="text-xl font-black text-foreground">{priorIssues}</span>
        </div>
      </div>
    </div>
  )
}
