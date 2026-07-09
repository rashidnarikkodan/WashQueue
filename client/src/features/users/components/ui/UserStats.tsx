import { Users, UserCheck, ShieldCheck, UserX } from "lucide-react";

interface UserStatsProps {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  ownersCount: number;
}

const UserStats = ({
  totalUsers,
  activeUsers,
  blockedUsers,
  ownersCount
}: UserStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</span>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Users size={22} />
        </div>
      </div>

      <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</span>
          <p className="text-3xl font-bold text-emerald-500">{activeUsers}</p>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
          <UserCheck size={22} />
        </div>
      </div>

      <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owners</span>
          <p className="text-3xl font-bold text-amber-500">{ownersCount}</p>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
          <ShieldCheck size={22} />
        </div>
      </div>

      <div className="flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blocked</span>
          <p className="text-3xl font-bold text-rose-500">{blockedUsers}</p>
        </div>
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
          <UserX size={22} />
        </div>
      </div>
    </div>
  );
};

export default UserStats;
