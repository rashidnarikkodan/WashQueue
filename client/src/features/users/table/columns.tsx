import { Link } from "react-router-dom"
import { Mail, Shield, Calendar, Ban, Check, Eye } from "lucide-react"
import type { Column } from "@/shared/components/data-table"
import type { User } from "../types"
import { ROLE, type RoleType } from "@/shared/constants/role.const"

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

export function getUserColumns(onToggleClick: (user: User) => void): Column<User>[] {
  return [
    {
      id: "info",
      header: "User Info",
      cell: (user) => (
        <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3 group/item">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/10 shadow-inner group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all">
            {getInitials(user.name)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground leading-none mb-1 group-hover/item:text-primary transition-colors hover:underline">
              {user.name || "Unnamed User"}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Mail size={12} />
              {user.email}
            </span>
          </div>
        </Link>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(
            user.role
          )}`}
        >
          <Shield size={12} />
          {user.role}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Joined Date",
      cell: (user) => (
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Calendar size={13} />
          {formatDate(user.createdAt)}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
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
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-2">
          {user.role !== ROLE.ADMIN && (
            <button
              onClick={() => onToggleClick(user)}
              title={!user.isBlocked ? "Block User" : "Activate User"}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                !user.isBlocked
                  ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-foreground"
                  : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-foreground"
              }`}
            >
              {!user.isBlocked ? <Ban size={15} /> : <Check size={15} />}
            </button>
          )}
        </div>
      ),
    },
  ]
}

export function getOwnerColumns(onViewApplication: (owner: User) => void): Column<User>[] {
  return [
    {
      id: "info",
      header: "Owner Info",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/10 shadow-inner">
            {getInitials(user.name)}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-foreground leading-none mb-1">
              {user.name || "Unnamed Owner"}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              {user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "businessName",
      header: "Business Name",
      cell: (user) => (
        <span className="font-semibold text-slate-350">
          {(user.onboardingDetails?.businessName as string) || "Not Setup"}
        </span>
      ),
    },
    {
      id: "onboardingStep",
      header: "Onboarding Step",
      cell: (user) => (
        <span className="bg- text-slate-400 border border-border/40 px-3 py-1.5 rounded-lg text-[11px] font-bold">
          Step {user.onboardingStep == 4 ? 3 : (user.onboardingStep ?? 1)} of 3
        </span>
      ),
    },
    {
      id: "verificationStatus",
      header: "Verification Status",
      cell: (user) => {
        if (user.isVerified) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Verified
            </span>
          )
        }
        if (user.onboardingStep === 4) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-blue-500/10 text-blue-500 border-blue-500/20">
              In Review
            </span>
          )
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-muted text-muted-foreground border-border/40">
            Draft
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (user) => (
        <button
          onClick={() => onViewApplication(user)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold tracking-wide transition-all cursor-pointer hover:text-primary"
        >
          <Eye size={12} />
          View Application
        </button>
      ),
    },
  ]
}
