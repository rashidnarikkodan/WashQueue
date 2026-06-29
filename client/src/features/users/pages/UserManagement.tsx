import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs";
import UserStats from "../components/ui/UserStats";
import UserTable from "../components/layout/UserTable";
import FilterCard from "../components/layout/FilterCard";
import { usersApi, type User } from "../service/users.api";
import type { PaginationMeta } from "@/shared/components/ui/Pagination";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    providers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Read URL Search Parameters
  const searchQuery = searchParams.get("q") || "";
  const roleFilter = searchParams.get("role") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const activeTab = (searchParams.get("tab") as "all" | "customer" | "provider") || "all";
  const highCancellation = searchParams.get("cancellation") === "true";
  const fraudFlag = searchParams.get("fraud") === "true";
  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = 5;

  // Fetch users when parameters change
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await usersApi.getUsers({
        page: currentPage,
        limit,
        search: searchQuery,
        role: roleFilter === "all" ? undefined : roleFilter,
        isBlocked: statusFilter === "all" ? undefined : statusFilter === "blocked"
      });

      // Filter by cancellation and fraud on client side since the backend doesn't support them
      let processedUsers = response.users;
      if (highCancellation) {
        // Since we don't have cancellation rates in the real model, mock it or use 0
        processedUsers = processedUsers.filter(() => false); 
      }
      if (fraudFlag) {
        processedUsers = processedUsers.filter(() => false);
      }

      setUsers(processedUsers);
      setPaginationMeta(response.pagination);
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to retrieve users");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, roleFilter, statusFilter, highCancellation, fraudFlag]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Helper to update URL params
  const updateParams = (newParams: Record<string, string | null | number | boolean>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || val === false || val === "all") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    // Reset pagination to page 1 unless page itself was modified
    if (!newParams.hasOwnProperty("page")) {
      params.delete("page");
    }

    setSearchParams(params, { replace: true });
  };

  // State wrapper setters
  const setSearchQuery = (q: string) => updateParams({ q });
  const setRoleFilter = (role: string) => updateParams({ role });
  const setStatusFilter = (status: string) => updateParams({ status });
  const setActiveTab = (tab: "all" | "customer" | "provider") => updateParams({ tab });
  const setHighCancellation = (cancellation: boolean) => updateParams({ cancellation });
  const setFraudFlag = (fraud: boolean) => updateParams({ fraud });
  const setCurrentPage = (page: number) => updateParams({ page });

  // Actions
  const handleToggleStatus = async (id: string) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;

    try {
      const newBlockedState = !targetUser.isBlocked;
      await usersApi.updateUser(id, { isBlocked: newBlockedState });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update block status");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await usersApi.deleteUser(id);
        fetchUsers();
      } catch (err: any) {
        alert(err.message || "Failed to delete user");
      }
    }
  };

  const handleExport = () => {
    // Generate CSV contents
    const headers = ["ID", "Name", "Email", "Role", "Blocked Status", "Joined Date"];
    const rows = users.map(u => [
      u.id, 
      u.name || "", 
      u.email, 
      u.role, 
      u.isBlocked ? "BLOCKED" : "ACTIVE", 
      new Date(u.createdAt).toISOString().split("T")[0]
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `washqueue_users_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#3E495D] hover:bg-[#3E495D]/85 text-[#BCC7DE] font-semibold px-4.5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md select-none cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 fill-[#BCC7DE]" viewBox="0 0 10 10">
            <path d="M4.74448 2.38526L7.62842 5.33429L6.80237 6.17096L5.30272 4.63746L5.24967 9.39133L4.08308 9.37832L4.13613 4.62444L2.60263 6.12409L1.79545 5.2692L4.74448 2.38526ZM8.2703 0.091126C8.59112 0.094706 8.86448 0.211999 9.09039 0.443006C9.31629 0.674013 9.42746 0.949924 9.42388 1.27074L9.40435 3.02063L8.23776 3.00761L8.25728 1.25772L1.25772 1.17961L1.23819 2.9295L0.071599 2.91649L0.091126 1.16659C0.094706 0.84578 0.211999 0.572419 0.443006 0.34651C0.674013 0.120602 0.949924 0.00943805 1.27074 0.013018L8.2703 0.091126Z" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      {/* Stats Cards */}
      <UserStats 
        totalUsers={stats.total}
        activeUsers={stats.active}
        blockedUsers={stats.blocked}
        providersCount={stats.providers}
      />

      {/* Tabs and Filters panel */}
      <FilterCard 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        highCancellation={highCancellation}
        setHighCancellation={setHighCancellation}
        fraudFlag={fraudFlag}
        setFraudFlag={setFraudFlag}
      />

      {/* Error state */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      {/* User Table layout */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm font-semibold">Fetching user directory...</span>
        </div>
      ) : (
        <UserTable 
          users={users}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteUser}
          paginationMeta={paginationMeta}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default UserManagement;
