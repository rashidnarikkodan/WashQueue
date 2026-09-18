import {
  History,
  CheckCircle,
  UserCheck,
  AlertTriangle,
  MessageSquare,
  Sparkles,
} from "lucide-react"

export interface ActivityItem {
  id: string
  type: "resolved" | "assigned" | "escalated" | "comment"
  title: string
  timeAgo: string
  issueId?: string
}

interface IssueRecentActivityProps {
  activities?: ActivityItem[]
  onViewAllHistory?: () => void
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "resolved",
    title: "Admin Sarah resolved #IS-77402",
    timeAgo: "2m ago",
    issueId: "IS-77402",
  },
  {
    id: "2",
    type: "assigned",
    title: "Manager David assigned to #IS-77409",
    timeAgo: "14m ago",
    issueId: "IS-77409",
  },
  {
    id: "3",
    type: "escalated",
    title: "System auto-escalated #IS-77412",
    timeAgo: "22m ago",
    issueId: "IS-77412",
  },
  {
    id: "4",
    type: "comment",
    title: "Customer Marcus added a comment",
    timeAgo: "45m ago",
    issueId: "IS-77412",
  },
]

export default function IssueRecentActivity({
  activities = DEFAULT_ACTIVITIES,
  onViewAllHistory,
}: IssueRecentActivityProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "resolved":
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      case "assigned":
        return <UserCheck className="w-3.5 h-3.5 text-blue-400" />
      case "escalated":
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
      case "comment":
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
      default:
        return <History className="w-3.5 h-3.5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Recent Activity Card */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            RECENT ACTIVITY
          </span>
          <History className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-3.5">
          {activities.map((item) => (
            <div key={item.id} className="flex items-start gap-3 text-left">
              <div className="w-6 h-6 rounded-full bg-muted/60 border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground/90 leading-tight">
                  {item.title}
                </p>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  {item.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border/60 text-center">
          <button
            type="button"
            onClick={onViewAllHistory}
            className="text-xs font-bold text-primary hover:underline transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>View All History</span>
          </button>
        </div>
      </div>

      {/* Performance Tip Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 shadow-sm space-y-2 text-left">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-black uppercase tracking-wider text-primary">
            PERFORMANCE TIP
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Critical response time is down 4% this week. Keep assigning priority issues within 5
          minutes to hit Gold Tier rewards.
        </p>
      </div>
    </div>
  )
}
