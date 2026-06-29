import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { ROLE } from "@/shared/constants/role.const";
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs";
import UserStats from "../components/ui/UserStats";
import AddUserModal from "../components/ui/AddUserModal";
import UserTable from "../components/layout/UserTable";

interface UserMock {
  id: string;
  name: string;
  email: string;
  role: keyof typeof ROLE;
  status: "ACTIVE" | "BLOCKED";
  joinedDate: string;
}

const INITIAL_USERS: UserMock[] = [
  { id: "1", name: "Alex Rivera", email: "alex.rivera@washqueue.com", role: "ADMIN", status: "ACTIVE", joinedDate: "2026-01-15" },
  { id: "2", name: "Marcus Chen", email: "marcus.chen@washqueue.com", role: "MANAGER", status: "ACTIVE", joinedDate: "2026-02-10" },
  { id: "3", name: "Sarah Jenkins", email: "sarah.j@washqueue.com", role: "PROVIDER", status: "ACTIVE", joinedDate: "2026-03-01" },
  { id: "4", name: "Elena Rostova", email: "elena.r@washqueue.com", role: "CUSTOMER", status: "ACTIVE", joinedDate: "2026-03-12" },
  { id: "5", name: "James Wilson", email: "j.wilson@washqueue.com", role: "PROVIDER", status: "BLOCKED", joinedDate: "2026-03-24" },
  { id: "6", name: "Aria Montgomery", email: "aria.m@washqueue.com", role: "CUSTOMER", status: "ACTIVE", joinedDate: "2026-04-02" },
  { id: "7", name: "David Kim", email: "d.kim@washqueue.com", role: "CUSTOMER", status: "BLOCKED", joinedDate: "2026-04-10" },
];

const UserManagement = () => {
  const [users, setUsers] = useState<UserMock[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "ACTIVE").length;
  const blockedUsers = users.filter(u => u.status === "BLOCKED").length;
  const providersCount = users.filter(u => u.role === "PROVIDER").length;

  // Actions
  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE"
        };
      }
      return user;
    }));
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const handleAddUser = (newUser: { name: string; email: string; role: keyof typeof ROLE }): boolean => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      setErrorMsg("Please fill in all fields.");
      return false;
    }

    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      setErrorMsg("A user with this email already exists.");
      return false;
    }

    const createdUser: UserMock = {
      id: (users.length + 1).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "ACTIVE",
      joinedDate: new Date().toISOString().split("T")[0] || ""
    };

    setUsers(prev => [createdUser, ...prev]);
    setErrorMsg("");
    return true;
  };

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination calculation
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * limit, currentPage * limit);

  const paginationMeta = {
    total,
    page: currentPage,
    limit,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Admin", path: "/admin/dashboard" }, { label: "Users" }]} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users, providers, and administration accounts.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <UserStats 
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        blockedUsers={blockedUsers}
        providersCount={providersCount}
      />

      {/* User Table and Filters layout */}
      <UserTable 
        users={paginatedUsers}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteUser}
        paginationMeta={paginationMeta}
        onPageChange={setCurrentPage}
      />

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setErrorMsg(""); }}
        onSubmit={handleAddUser}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
      />
    </div>
  );
};

export default UserManagement;
