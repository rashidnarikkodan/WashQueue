import { Mail, Phone, Shield, User as UserIcon, Send, UserCheck, UserX } from "lucide-react";
import Loading from "../../../../shared/components/ui/Loading";
import { ROLE } from "../../../../shared/constants/role.const";
import type { User } from "../../types";

interface UserDetailsHeaderProps {
  user: User;
  isSuspending: boolean;
  onToggleBlock: () => void;
  onScrollToNotification: () => void;
}

export default function UserDetailsHeader({
  user,
  isSuspending,
  onToggleBlock,
  onScrollToNotification,
}: UserDetailsHeaderProps) {
  const getInitials = (name: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRelativeTime = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just active";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatJoinedDate = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr)
      .toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      .toUpperCase();
  };

  return (
    <div className="border border-border bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-2xl flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between relative overflow-hidden">
      {/* Decorative subtle background gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center w-full xl:w-auto">
        {/* Large Initials Avatar */}
        <div className="w-20 h-20 rounded-full bg-muted text-primary border border-primary/20 font-extrabold flex items-center justify-center text-3xl shadow-inner shrink-0">
          {getInitials(user.name)}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {user.name || "N/A"}
            </h1>

            {/* Active/Blocked Status dot tag */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                user.isBlocked
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${user.isBlocked ? "bg-rose-400" : "bg-emerald-400"}`} />
              {user.isBlocked ? "BLOCKED" : "ACTIVE"}
            </span>
          </div>

          {/* Email & Phone */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-muted-foreground" />
              {user.email}
            </span>
            {user.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="text-muted-foreground" />
                {user.phone}
              </span>
            )}
          </div>

          {/* Badges for Authentication & Role */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#1e293b] text-muted-foreground border border-border">
              <Shield size={11} className="text-muted-foreground" />
              {user.authProvider === "GOOGLE" ? "GOOGLE Google Auth" : "LOCAL Password Auth"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              <UserIcon size={11} className="text-primary" />
              {user.role === ROLE.ADMIN
                ? "System Administrator"
                : user.role === ROLE.MANAGER
                ? "Manager"
                : user.role === ROLE.OWNER
                ? "Business Owner"
                : "Customer"}
            </span>
          </div>
        </div>
      </div>

      {/* Right side buttons & relative time meta */}
      <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-end gap-4 w-full xl:w-auto pt-4 xl:pt-0 border-t border-border/40 xl:border-t-0 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Send Notification focus/trigger */}
          <button
            onClick={onScrollToNotification}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-border hover:bg-muted text-muted-foreground font-semibold text-xs transition-all cursor-pointer"
          >
            <Send size={13} />
            <span>Send Notification</span>
          </button>

          {/* Suspend / Activate Account Button */}
          <button
            onClick={onToggleBlock}
            disabled={isSuspending}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              user.isBlocked
                ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-slate-950"
                : "border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500 hover:text-foreground"
            }`}
          >
            {isSuspending ? (
              <Loading size="sm" />
            ) : user.isBlocked ? (
              <>
                <UserCheck size={14} />
                <span>Activate</span>
              </>
            ) : (
              <>
                <UserX size={14} />
                <span>Suspend</span>
              </>
            )}
          </button>
        </div>

        {/* Joined & Active dates info */}
        <div className="text-muted-foreground text-[11px] font-bold tracking-wider text-left sm:text-right xl:text-right space-y-0.5">
          <p>
            JOINED: <span className="text-foreground">{formatJoinedDate(user.createdAt)}</span>
          </p>
          <p>
            LAST ACTIVE:{" "}
            <span className="text-emerald-400">
              {getRelativeTime(user.lastLoginAt || user.updatedAt)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
