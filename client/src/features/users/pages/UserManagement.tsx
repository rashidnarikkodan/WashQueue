import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs";
import UserStats from "../components/ui/UserStats";
import { usersApi } from "../service/users.api";
import { FILTER_STATUS } from "@/shared/constants/status.const";
import type { PaginationMeta } from "@/shared/types";
import { getErrorMessage } from "@/shared/utils/error";
import type { User } from "../types";
import { DataTable } from "@/shared/components/data-table";
import { getUserColumns } from "../table/columns";
import { userTabs } from "../table/tabs";
import { buildUserFilters } from "../table/filters";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    owners: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingToggleUser, setPendingToggleUser] = useState<User | null>(null);

  // ─── URL-driven state ───────────────────────────────────────────────────────
  const searchQuery = searchParams.get("q") || "";
  const roleFilter = searchParams.get("role") || "all";
  const statusFilter = searchParams.get("status") || FILTER_STATUS.ALL;
  const activeTab =
    roleFilter === "customer" || roleFilter === "owner" ? roleFilter : "all";
  const highCancellation = searchParams.get("cancellation") === "true";
  const fraudFlag = searchParams.get("fraud") === "true";
  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = 5;

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await usersApi.getUsers({
        page: currentPage,
        limit,
        search: searchQuery,
        role: roleFilter === "all" ? undefined : roleFilter,
        isBlocked:
          statusFilter === FILTER_STATUS.ALL
            ? undefined
            : statusFilter === FILTER_STATUS.BLOCKED,
      });

      let processedUsers = response.users;
      if (highCancellation) processedUsers = processedUsers.filter(() => false);
      if (fraudFlag) processedUsers = processedUsers.filter(() => false);

      setUsers(processedUsers);
      setPaginationMeta(response.pagination);
      if (response.stats) setStats(response.stats);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Failed to retrieve users"));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, roleFilter, statusFilter, highCancellation, fraudFlag]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  // ─── URL param helpers ──────────────────────────────────────────────────────
  const updateParams = (
    newParams: Record<string, string | null | number | boolean>
  ) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (
        val === null ||
        val === "" ||
        val === false ||
        val === FILTER_STATUS.ALL
      ) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    if (!Object.prototype.hasOwnProperty.call(newParams, "page")) {
      params.delete("page");
    }
    setSearchParams(params, { replace: true });
  };

  const setSearchQuery = (q: string) => updateParams({ q });
  const setRoleFilter = (role: string) => updateParams({ role });
  const setStatusFilter = (status: string) => updateParams({ status });
  const setHighCancellation = (cancellation: boolean) =>
    updateParams({ cancellation });
  const setFraudFlag = (fraud: boolean) => updateParams({ fraud });
  const setCurrentPage = (page: number) => updateParams({ page });

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleConfirmToggle = async () => {
    if (!pendingToggleUser) return;
    try {
      await usersApi.updateUser(pendingToggleUser.id, {
        isBlocked: !pendingToggleUser.isBlocked,
      });
      fetchUsers();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to update block status"));
    } finally {
      setPendingToggleUser(null);
    }
  };

  const handleExport = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Blocked Status",
      "Joined Date",
    ];
    const rows = users.map((u) => [
      u.id,
      u.name || "",
      u.email,
      u.role,
      u.isBlocked ? "BLOCKED" : "ACTIVE",
      new Date(u.createdAt).toISOString().split("T")[0],
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `washqueue_users_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Table configuration (built each render — cheap) ───────────────────────
  const columns = getUserColumns((user) => setPendingToggleUser(user));
  const { selectFilters, toggleFilters } = buildUserFilters({
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    highCancellation,
    setHighCancellation,
    fraudFlag,
    setFraudFlag,
  });

  const isBlocking = pendingToggleUser ? !pendingToggleUser.isBlocked : false;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Admin", path: "/admin/dashboard" }, { label: "Users" }]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users, owners, and administration accounts.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-muted hover:opacity-90 text-muted-foreground font-semibold px-4.5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md select-none cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 fill-muted-foreground"
            viewBox="0 0 10 10"
          >
            <path d="M4.74448 2.38526L7.62842 5.33429L6.80237 6.17096L5.30272 4.63746L5.24967 9.39133L4.08308 9.37832L4.13613 4.62444L2.60263 6.12409L1.79545 5.2692L4.74448 2.38526ZM8.2703 0.091126C8.59112 0.094706 8.86448 0.211999 9.09039 0.443006C9.31629 0.674013 9.42746 0.949924 9.42388 1.27074L9.40435 3.02063L8.23776 3.00761L8.25728 1.25772L1.25772 1.17961L1.23819 2.9295L0.071599 2.91649L0.091126 1.16659C0.094706 0.84578 0.211999 0.572419 0.443006 0.34651C0.674013 0.120602 0.949924 0.00943805 1.27074 0.013018L8.2703 0.091126Z" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      {/* Stats */}
      <UserStats
        totalUsers={stats.total}
        activeUsers={stats.active}
        blockedUsers={stats.blocked}
        ownersCount={stats.owners}
      />

      {/* DataTable :owns toolbar, table, pagination */}
      <DataTable<User>
        columns={columns}
        data={users}
        rowKey={(u) => u.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchLabel="Search Users"
        searchPlaceholder="Name, email, or phone..."
        tabs={userTabs}
        activeTab={activeTab}
        onTabChange={(tab) => setRoleFilter(tab)}
        selectFilters={selectFilters}
        toggleFilters={toggleFilters}
        isLoading={isLoading}
        loadingText="Fetching user directory..."
        errorMsg={errorMsg}
        emptyMessage="No users found matching the query."
        pagination={paginationMeta}
        onPageChange={setCurrentPage}
      />

      {/* Block / Unblock Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!pendingToggleUser}
        onClose={() => setPendingToggleUser(null)}
        onConfirm={handleConfirmToggle}
        title={isBlocking ? "Block this user?" : "Unblock this user?"}
        message={
          isBlocking
            ? `${pendingToggleUser?.name || "This user"} will be immediately logged out and prevented from accessing the platform.`
            : `${pendingToggleUser?.name || "This user"} will regain full access to the platform.`
        }
        confirmText={isBlocking ? "Yes, Block" : "Yes, Unblock"}
        cancelText="Cancel"
        confirmVariant={isBlocking ? "danger" : "success"}
      />
    </div>
  );
};

export default UserManagement;
