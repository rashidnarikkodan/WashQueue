import { Link } from "react-router-dom";
import { Search, Mail, Shield, Calendar, Ban, Check, Trash2 } from "lucide-react";
import { ROLE } from "../../../../shared/constants/role.const";
import Pagination, { type PaginationMeta } from "@/shared/components/ui/Pagination";

interface User {
  id: string;
  name: string;
  email: string;
  role: keyof typeof ROLE;
  status: "ACTIVE" | "BLOCKED";
  joinedDate: string;
}

interface UserTableProps {
  users: User[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  paginationMeta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const UserTable = ({
  users,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onToggleStatus,
  onDelete,
  paginationMeta,
  onPageChange
}: UserTableProps) => {
  // Get Initials for Avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeStyle = (role: keyof typeof ROLE) => {
    switch (role) {
      case "ADMIN":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "MANAGER":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "PROVIDER":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  return (
    <div className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border border-border/80 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto">
          <div className="flex-1 md:flex-none">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-40 bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="PROVIDER">Provider</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>

          <div className="flex-1 md:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40 bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>
      </div>

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
                  <td className="py-4 px-6">
                    <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3 group/item">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/10 shadow-inner group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground leading-none mb-1 group-hover/item:text-primary transition-colors hover:underline">{user.name}</span>
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
                      {user.joinedDate}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${user.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggleStatus(user.id)}
                        title={user.status === "ACTIVE" ? "Block User" : "Activate User"}
                        className={`p-2 rounded-lg border transition-all ${user.status === "ACTIVE"
                            ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white"
                            : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
                          }`}
                      >
                        {user.status === "ACTIVE" ? <Ban size={15} /> : <Check size={15} />}
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        title="Delete User"
                        className="p-2 rounded-lg border border-border/80 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                      >
                        <Trash2 size={15} />
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
