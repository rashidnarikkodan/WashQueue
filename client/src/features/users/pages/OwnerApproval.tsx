import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import UserStats from "../components/ui/UserStats"
import { usersApi } from "@/shared/apis/users.api"
import type { User } from "../types"
import type { PaginationMeta } from "@/shared/components/ui/Pagination"
import OnboardingDetailsSummary from "../components/ui/OnboardingDetailsSummary"
import { DataTable } from "@/shared/components/data-table"
import { getOwnerColumns } from "../table/columns"
import { ownerApprovalTabs } from "../table/tabs"

const OwnerApproval = () => {
  const [owners, setOwners] = useState<User[]>([])
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [rejectingOwnerId, setRejectingOwnerId] = useState<string | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState("")

  // ─── URL-driven state ───────────────────────────────────────────────────────
  const searchQuery = searchParams.get("q") || ""
  const activeTab = (searchParams.get("tab") as "all" | "customer" | "owner") || "customer"
  const currentPage = Number(searchParams.get("page")) || 1
  const limit = 10

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const fetchOwners = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const response = await usersApi.getUsers({
        page: currentPage,
        limit,
        role: "owner",
        search: searchQuery || undefined,
      })

      const allOwnersResponse = await usersApi.getUsers({
        page: 1,
        limit: 100,
        role: "owner",
      })

      const totalCount = allOwnersResponse.users.length
      const approvedCount = allOwnersResponse.users.filter((u: User) => u.isVerified).length
      const pendingCount = allOwnersResponse.users.filter(
        (u: User) => u.onboardingStep === 4 && !u.isVerified
      ).length

      setStats({ total: totalCount, approved: approvedCount, pending: pendingCount })

      let processed = response.users
      if (activeTab === "customer") {
        processed = processed.filter((u: User) => u.onboardingStep === 4 && !u.isVerified)
      } else if (activeTab === "owner") {
        processed = processed.filter((u: User) => u.isVerified)
      }

      setOwners(processed)
      setPaginationMeta(response.pagination)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to retrieve owner applications")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, activeTab])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOwners()
  }, [fetchOwners])

  // ─── URL param helpers ──────────────────────────────────────────────────────
  const updateParams = (newParams: Record<string, string | null | number | boolean>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || val === false) {
        params.delete(key)
      } else {
        params.set(key, String(val))
      }
    })
    if (!Object.prototype.hasOwnProperty.call(newParams, "page")) {
      params.delete("page")
    }
    setSearchParams(params, { replace: true })
  }

  const setSearchQuery = (q: string) => updateParams({ q })
  const setActiveTab = (tab: string) => updateParams({ tab })
  const setCurrentPage = (page: number) => updateParams({ page })

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    try {
      await usersApi.updateUser(id, { isVerified: true })
      toast.success("Owner approved and activated successfully!")
      if (selectedOwner?.id === id) {
        setSelectedOwner((prev: User | null) => (prev ? { ...prev, isVerified: true } : null))
      }
      fetchOwners()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to approve owner")
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      await usersApi.updateUser(id, {
        isVerified: false,
        onboardingStep: 1,
        rejectionReason: reason,
      })
      toast.info("Owner application rejected and details reset.")
      if (selectedOwner?.id === id) setSelectedOwner(null)
      setRejectingOwnerId(null)
      setRejectionReasonInput("")
      fetchOwners()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to reject owner")
    }
  }

  // ─── Table configuration ────────────────────────────────────────────────────
  const columns = getOwnerColumns((owner) => setSelectedOwner(owner))

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Admin", path: "/admin/dashboard" }, { label: "Owner Verification" }]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Owner Verification</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review onboarding documents and approve station owner applications.
          </p>
        </div>
      </div>

      {/* Stats */}
      <UserStats
        totalUsers={stats.total}
        activeUsers={stats.approved}
        blockedUsers={stats.pending}
        ownersCount={0}
        isOwnerApproval={true}
      />

      {/* DataTable */}
      <DataTable<User>
        columns={columns}
        data={owners}
        rowKey={(u) => u.id}
        // Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchLabel="Search Owners"
        searchPlaceholder="Name or email..."
        tabs={ownerApprovalTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        // State
        isLoading={isLoading}
        loadingText="Fetching owner applications..."
        errorMsg={errorMsg}
        emptyMessage="No owner applications found."
        // Pagination
        pagination={paginationMeta}
        onPageChange={setCurrentPage}
      />

      {/* Slide-over Application Details Panel */}
      {selectedOwner && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div onClick={() => setSelectedOwner(null)} className="absolute inset-0 cursor-pointer" />
          <div className="relative w-full max-w-lg bg-card border-l border-border/80 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border/40 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-100 tracking-tight">
                  Onboarding Application
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Review details and verification documents
                </p>
              </div>
              <button
                onClick={() => setSelectedOwner(null)}
                className="w-8 h-8 rounded-full border border-border/80 hover:bg-muted flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <OnboardingDetailsSummary
                details={selectedOwner.onboardingDetails || {}}
                email={selectedOwner.email}
              />
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-border/40 flex items-center gap-4 bg-muted/10">
              {!selectedOwner.isVerified ? (
                <>
                  <button
                    onClick={() => handleApprove(selectedOwner.id)}
                    className="flex-grow inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <CheckCircle2 size={14} />
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      setRejectingOwnerId(selectedOwner.id)
                      setRejectionReasonInput("")
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-500 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </>
              ) : (
                <div className="w-full py-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 rounded-xl text-center text-xs font-black uppercase tracking-wider select-none flex items-center justify-center gap-1.5">
                  <ShieldCheck size={16} />
                  Verified &amp; Active
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Rejection Reason Modal */}
      {rejectingOwnerId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                  Reject Application
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Specify feedback for the car wash partner
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Identity document is blurry, or IFSC code does not match Federal Bank branch name. Please update..."
                  className="w-full h-32 bg-muted/90 text-foreground border border-border/80 rounded-xl p-4 text-sm placeholder-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setRejectingOwnerId(null)}
                  className="flex-1 py-3 border border-slate-800 hover:bg-slate-900/60 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectionReasonInput.trim()}
                  onClick={() => handleReject(rejectingOwnerId, rejectionReasonInput.trim())}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Reject &amp; Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerApproval
