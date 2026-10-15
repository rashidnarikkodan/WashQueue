import React from "react"
import { Link } from "react-router-dom"
import { Mail, Shield, Calendar, Ban, Check, ChevronRight } from "lucide-react"
import type { User } from "../../types"
import { ROLE, type RoleType } from "@/shared/constants/role.const"

interface UserMobileCardProps {
  user: User
  onToggleClick: (user: User) => void
}

const getInitials = (name: string) => {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const getRoleBadgeStyle = (role: RoleType) => {
  switch (role) {
    case ROLE.ADMIN:
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case ROLE.MANAGER:
      return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    case ROLE.OWNER:
      return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    default:
      return "bg-green-500/10 text-green-500 border-green-500/20"
  }
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toISOString().split("T")[0]
  } catch {
    return dateStr
  }
}

export const UserMobileCard: React.FC<UserMobileCardProps> = ({ user, onToggleClick }) => {
  return (
    <div className="p-3.5 bg-card/70 border border-border/60 rounded-xl space-y-3 text-left shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/admin/users/${user.id}`} className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/10 shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-xs block truncate leading-tight">
              {user.name || "Unnamed User"}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate mt-0.5">
              <Mail size={10} className="shrink-0" />
              <span className="truncate">{user.email}</span>
            </span>
          </div>
        </Link>

        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            !user.isBlocked
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              !user.isBlocked ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {!user.isBlocked ? "ACTIVE" : "BLOCKED"}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRoleBadgeStyle(
              user.role
            )}`}
          >
            <Shield size={10} />
            {user.role}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
            <Calendar size={10} />
            {formatDate(user.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user.role !== ROLE.ADMIN && (
            <button
              onClick={() => onToggleClick(user)}
              title={!user.isBlocked ? "Block User" : "Activate User"}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                !user.isBlocked
                  ? "border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white"
                  : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white"
              }`}
            >
              {!user.isBlocked ? <Ban size={11} /> : <Check size={11} />}
              <span>{!user.isBlocked ? "Block" : "Unblock"}</span>
            </button>
          )}
          <Link
            to={`/admin/users/${user.id}`}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
          >
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserMobileCard
