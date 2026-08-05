import { useState, useEffect, useCallback, useMemo } from "react"
import DataTable from "@/shared/components/data-table/DataTable"
import type { Column, SelectFilter, TabConfig } from "@/shared/components/data-table/types"
import { managerApi } from "@/shared/apis/manager.api"
import type { ManagerListItem, ManagerInvitationItem } from "@/shared/apis/manager.api"
import { stationApi } from "@/shared/apis/station.api"
import type { Station } from "@/features/station/types"
import { InviteManagerModal } from "../components/InviteManagerModal"
import { UpdatePermissionsModal } from "../components/UpdatePermissionsModal"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { toast } from "sonner"


export const ManagerManagementPage = () => {
  const [managers, setManagers] = useState<ManagerListItem[]>([])
  const [invitations, setInvitations] = useState<ManagerInvitationItem[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedStationFilter, setSelectedStationFilter] = useState("ALL")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL")

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [editingManager, setEditingManager] = useState<ManagerListItem | null>(null)

  // Confirmation modal state
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmVariant: "primary" | "danger" | "warning" | "success"
    confirmText: string
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmVariant: "primary",
    confirmText: "Confirm",
    onConfirm: async () => {},
  })

  const user = useAuthStore((state) => state.user)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const ownerUserId = user?.ownerId || user?.id
      const [mgrRes, invRes, stnRes] = await Promise.all([
        managerApi.getOwnerManagers({ limit: 100 }),
        managerApi.getOwnerInvitations(),
        stationApi.getStations({ ownerId: ownerUserId, limit: 100, status: "all" }),
      ])
      setManagers(mgrRes.managers || [])
      setInvitations(invRes || [])
      setStations(stnRes.stations || [])
    } catch {
      toast.error("Failed to load manager data")
    } finally {
      setLoading(false)
    }
  }, [user])


  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Stats calculation
  const totalManagers = managers.length
  const activeCount = managers.filter((m) => m.status === "ACTIVE").length
  const suspendedCount = managers.filter((m) => m.status === "SUSPENDED").length
  const pendingInvitationsCount = invitations.filter((i) => i.status === "PENDING").length

  // Filtered rows for DataTable
  const filteredManagers = useMemo(() => {
    return managers.filter((m) => {
      // Tab filter
      if (activeTab === "active" && m.status !== "ACTIVE") return false
      if (activeTab === "suspended" && m.status !== "SUSPENDED") return false

      // Station filter
      if (selectedStationFilter !== "ALL" && m.stationId !== selectedStationFilter) return false

      // Status filter
      if (selectedStatusFilter !== "ALL" && m.status !== selectedStatusFilter) return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = m.managerName?.toLowerCase().includes(q)
        const matchEmail = m.managerEmail.toLowerCase().includes(q)
        const matchStation = m.stationName.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchStation) return false
      }

      return true
    })
  }, [managers, activeTab, selectedStationFilter, selectedStatusFilter, searchQuery])

  // Handle Suspend/Reactivate
  const handleToggleSuspend = (manager: ManagerListItem) => {
    const isSuspending = manager.status === "ACTIVE"
    setConfirmModalState({
      isOpen: true,
      title: isSuspending ? "Suspend Manager" : "Reactivate Manager",
      message: isSuspending
        ? `Are you sure you want to suspend manager ${manager.managerName || manager.managerEmail}? They will temporarily lose access to station manager features.`
        : `Reactivate manager access for ${manager.managerName || manager.managerEmail}?`,
      confirmVariant: isSuspending ? "warning" : "primary",
      confirmText: isSuspending ? "Suspend" : "Reactivate",
      onConfirm: async () => {
        try {
          if (isSuspending) {
            await managerApi.suspendManager(manager.managerId || manager.assignmentId)
            toast.success("Manager suspended")
          } else {
            await managerApi.reactivateManager(manager.managerId || manager.assignmentId)
            toast.success("Manager reactivated")
          }
          fetchData()
        } catch {
          toast.error("Operation failed")
        }
      },
    })
  }

  // Handle Remove Manager
  const handleRemoveManager = (manager: ManagerListItem) => {
    setConfirmModalState({
      isOpen: true,
      title: "Remove Manager Assignment",
      message: `Are you sure you want to remove manager assignment for ${
        manager.managerName || manager.managerEmail
      } at ${manager.stationName}? Note: The user account will NOT be deleted.`,
      confirmVariant: "danger",
      confirmText: "Remove Assignment",
      onConfirm: async () => {
        try {
          await managerApi.removeManager(manager.managerId || manager.assignmentId)
          toast.success("Manager assignment removed")
          fetchData()
        } catch {
          toast.error("Failed to remove manager")
        }
      },
    })
  }

  // Handle Resend Invitation
  const handleResendInvitation = async (invitationId: string) => {
    try {
      await managerApi.resendInvitation(invitationId)
      toast.success("Invitation link resent successfully")
      fetchData()
    } catch {
      toast.error("Failed to resend invitation")
    }
  }

  // Handle Cancel Invitation
  const handleCancelInvitation = (invitationId: string, email: string) => {
    setConfirmModalState({
      isOpen: true,
      title: "Cancel Invitation",
      message: `Are you sure you want to cancel the pending invitation sent to ${email}?`,
      confirmVariant: "danger",
      confirmText: "Cancel Invitation",
      onConfirm: async () => {
        try {
          await managerApi.cancelInvitation(invitationId)
          toast.success("Invitation cancelled")
          fetchData()
        } catch {
          toast.error("Failed to cancel invitation")
        }
      },
    })
  }

  // Table Tabs Configuration
  const tabs: TabConfig[] = [
    { id: "all", label: `All Managers (${totalManagers})` },
    { id: "active", label: `Active (${activeCount})` },
    { id: "suspended", label: `Suspended (${suspendedCount})` },
    { id: "invitations", label: `Pending Invitations (${pendingInvitationsCount})` },
  ]

  // Select Filters
  const selectFilters: SelectFilter[] = [
    {
      id: "station",
      label: "Station",
      value: selectedStationFilter,
      onChange: setSelectedStationFilter,
      options: [
        { label: "All Stations", value: "ALL" },
        ...stations.map((s) => ({ label: s.name, value: s.id })),
      ],
    },
    {
      id: "status",
      label: "Status",
      value: selectedStatusFilter,
      onChange: setSelectedStatusFilter,
      options: [
        { label: "All Statuses", value: "ALL" },
        { label: "Active", value: "ACTIVE" },
        { label: "Suspended", value: "SUSPENDED" },
      ],
    },
  ]

  // Table Columns Definition for Managers
  const managerColumns: Column<ManagerListItem>[] = [
    {
      id: "manager",
      header: "Manager",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ADC6FF]/15 border border-[#ADC6FF]/30 text-[#ADC6FF] flex items-center justify-center font-bold text-sm">
            {(row.managerName || row.managerEmail)[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-[#DCE1FB]">{row.managerName || "Unnamed Manager"}</p>
            <p className="text-xs text-slate-400">{row.managerEmail}</p>
          </div>
        </div>
      ),
    },
    {
      id: "station",
      header: "Assigned Station",
      cell: (row) => <span className="font-medium text-slate-300">{row.stationName}</span>,
    },
    {
      id: "permissions",
      header: "Permissions",
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.permissions.map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#ADC6FF]/10 text-[#ADC6FF] border border-[#ADC6FF]/20"
            >
              {p.replace("_MANAGEMENT", "").replace("_VIEW", "").replace("_", " ")}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.status === "ACTIVE"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-[#2E3447] text-slate-400 border border-slate-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditingManager(row)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-700 text-[#ADC6FF] hover:bg-[#ADC6FF]/10 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleSuspend(row)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              row.status === "ACTIVE"
                ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {row.status === "ACTIVE" ? "Suspend" : "Reactivate"}
          </button>
          <button
            onClick={() => handleRemoveManager(row)}
            className="px-2.5 py-1 text-xs rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Remove
          </button>
        </div>
      ),
    },
  ]

  // Table Columns Definition for Invitations
  const invitationColumns: Column<ManagerInvitationItem>[] = [
    {
      id: "invitation",
      header: "Invited Email",
      cell: (row) => (
        <div>
          <p className="font-medium text-[#DCE1FB]">{row.email}</p>
          {row.name && <p className="text-xs text-slate-400">{row.name}</p>}
        </div>
      ),
    },
    {
      id: "station",
      header: "Target Station",
      cell: (row) => {
        const stn = stations.find((s) => s.id === row.stationId)
        return <span className="font-medium text-slate-300">{stn?.name || "Station"}</span>
      },
    },
    {
      id: "permissions",
      header: "Assigned Permissions",
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.permissions.map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#ADC6FF]/10 text-[#ADC6FF] border border-[#ADC6FF]/20"
            >
              {p.replace("_MANAGEMENT", "").replace("_VIEW", "").replace("_", " ")}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          {row.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleResendInvitation(row.id)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-700 text-[#ADC6FF] hover:bg-[#ADC6FF]/10 transition-colors"
          >
            Resend Link
          </button>
          <button
            onClick={() => handleCancelInvitation(row.id, row.email)}
            className="px-2.5 py-1 text-xs rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assign station managers (1 station per manager), configure granular permissions, and track active team access.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#ADC6FF] text-[#002E6A] font-semibold text-sm hover:bg-[#92b5ff] transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3.33334V12.6667M3.33334 8H12.6667"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Invite Manager</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card/60 border border-border/80 shadow-sm space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Total Managers</p>
          <p className="text-3xl font-bold text-foreground">{totalManagers}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card/60 border border-border/80 shadow-sm space-y-2">
          <p className="text-xs font-medium text-emerald-400">Active Managers</p>
          <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card/60 border border-border/80 shadow-sm space-y-2">
          <p className="text-xs font-medium text-amber-400">Pending Invitations</p>
          <p className="text-3xl font-bold text-amber-400">{pendingInvitationsCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card/60 border border-border/80 shadow-sm space-y-2">
          <p className="text-xs font-medium text-slate-400">Suspended</p>
          <p className="text-3xl font-bold text-slate-400">{suspendedCount}</p>
        </div>
      </div>

      {/* Main DataTable Component */}
      {activeTab === "invitations" ? (
        <DataTable<ManagerInvitationItem>
          columns={invitationColumns}
          data={invitations}
          rowKey={(row) => row.id}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isLoading={loading}
          emptyMessage="No pending manager invitations found."
        />
      ) : (
        <DataTable<ManagerListItem>
          columns={managerColumns}
          data={filteredManagers}
          rowKey={(row) => row.managerId || row.assignmentId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by name, email, or station..."
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectFilters={selectFilters}
          isLoading={loading}
          emptyMessage="No station managers found."
        />
      )}

      {/* Modals */}
      <InviteManagerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchData}
      />

      <UpdatePermissionsModal
        isOpen={!!editingManager}
        manager={editingManager}
        onClose={() => setEditingManager(null)}
        onSuccess={fetchData}
      />

      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmVariant={confirmModalState.confirmVariant}
        confirmText={confirmModalState.confirmText}
      />
    </div>
  )
}

export default ManagerManagementPage
