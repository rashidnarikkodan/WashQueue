import { Link } from "react-router-dom";
import { Mail, Shield, Calendar, Ban, Check } from "lucide-react";
import type { User } from "../../service/users.api";
import { ROLE, type RoleType } from "../../../../shared/constants/role.const";
import Pagination, { type PaginationMeta } from "@/shared/components/ui/Pagination";

interface UserTableProps {
  users: User[];
  paginationMeta: PaginationMeta;
  onPageChange: (page: number) => void;
  onToggleStatus: (id: string) => void;
}

const UserTable = ({
  users,
  paginationMeta,
  onPageChange,
  onToggleStatus,
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
      case ROLE.PROVIDER:
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
            <tr className="bg-muted/30 border-b border-border/70 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
              <th className="py-4 px-6">User Info</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Joined Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/10 transition-colors">
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
                      <button
                        onClick={() => onToggleStatus(user.id)}
                        title={!user.isBlocked ? "Block User" : "Activate User"}
                        className={`p-2 rounded-lg border transition-all ${!user.isBlocked
                            ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white"
                            : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
                          }`}
                      >
                        {!user.isBlocked ? <Ban size={15} /> : <Check size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 px-6 text-center text-muted-foreground font-medium">
                  No users found matching the query.
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
