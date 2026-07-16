import {
  Users,
  UserCheck,
  ShieldCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react"

interface UserStatsProps {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  ownersCount: number
  isOwnerApproval?: boolean
}

const UserStats = ({
  totalUsers,
  activeUsers,
  blockedUsers,
  ownersCount,
  isOwnerApproval = false,
}: UserStatsProps) => {
  if (isOwnerApproval) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Review */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Review
            </span>
            <p className="text-3xl font-bold text-amber-500">{blockedUsers}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <AlertCircle size={22} />
          </div>
        </div>

        {/* Approved Owners */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Approved Owners
            </span>
            <p className="text-3xl font-bold text-emerald-500">{activeUsers}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Total Owners */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Owners
            </span>
            <p className="text-3xl font-bold text-primary">{totalUsers}</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FileText size={22} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Users
          </span>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Users size={22} />
        </div>
      </div>

      <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active
          </span>
          <p className="text-3xl font-bold text-emerald-500">{activeUsers}</p>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
          <UserCheck size={22} />
        </div>
      </div>

      <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Owners
          </span>
          <p className="text-3xl font-bold text-amber-500">{ownersCount}</p>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
          <ShieldCheck size={22} />
        </div>
      </div>

      <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Blocked
          </span>
          <p className="text-3xl font-bold text-rose-500">{blockedUsers}</p>
        </div>
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
          <UserX size={22} />
        </div>
      </div>
    </div>
  )
}

export default UserStats
