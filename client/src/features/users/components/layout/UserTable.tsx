import { Link } from "react-router-dom";
import { Mail, Shield, Calendar, Ban, Check, Eye } from "lucide-react";
import type { User } from "../../types";
import { ROLE, type RoleType } from "../../../../shared/constants/role.const";
import Pagination, { type PaginationMeta } from "@/shared/components/ui/Pagination";

interface UserTableProps {
  users: User[];
  paginationMeta: PaginationMeta;
  onPageChange: (page: number) => void;
  onToggleStatus?: (id: string) => void;
  isOwnerApproval?: boolean;
  onViewApplication?: (owner: User) => void;
  errorMsg?: string | null;
}

const UserTable = ({
  users,
  paginationMeta,
  onPageChange,
  onToggleStatus,
  isOwnerApproval = false,
  onViewApplication,
  errorMsg,
}: UserTableProps) => {
  // Get Initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeStyle = (role: RoleType) => {
    switch (role) {
      case ROLE.ADMIN:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case ROLE.MANAGER:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case ROLE.OWNER:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            {isOwnerApproval ? (
              <tr className="bg-muted/30 border-b border-border/70 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Owner Info</th>
                <th className="py-4 px-6">Business Name</th>
                <th className="py-4 px-6">Onboarding Step</th>
                <th className="py-4 px-6">Verification Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            ) : (
              <tr className="bg-muted/30 border-b border-border/70 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">User Info</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-border/60">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                  {isOwnerApproval ? (
                    <>
                      <td className="py-4 px-6">
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
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-350">
                        {user.onboardingDetails?.businessName || "Not Setup"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-900 text-slate-400 border border-border/40 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          Step {user.onboardingStep ?? 1} of 3
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            Verified
                          </span>
                        ) : user.onboardingStep === 4 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-blue-500/10 text-blue-500 border-blue-500/20">
                            In Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-muted text-muted-foreground border-border/40">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {onViewApplication && (
                          <button
                            onClick={() => onViewApplication(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold tracking-wide transition-all cursor-pointer hover:text-primary"
                          >
                            <Eye size={12} />
                            View Application
                          </button>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-6 ">
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
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(user.role)}`}>
                          <Shield size={12} />
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${!user.isBlocked
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${!user.isBlocked ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {!user.isBlocked ? "ACTIVE" : "BLOCKED"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onToggleStatus && (
                            <button
                              onClick={() => onToggleStatus(user.id)}
                              title={!user.isBlocked ? "Block User" : "Activate User"}
                              className={`p-2 rounded-lg border transition-all ${!user.isBlocked
                                  ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-foreground"
                                  : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-foreground"
                                }`}
                            >
                              {!user.isBlocked ? <Ban size={15} /> : <Check size={15} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 px-6 text-center text-muted-foreground font-medium">
                  {errorMsg ? (
                    <span className="text-rose-400 font-semibold">{errorMsg}</span>
                  ) : (
                    "No users found matching the query."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination meta={paginationMeta} onPageChange={onPageChange} />
    </div>
  );
};

export default UserTable;
