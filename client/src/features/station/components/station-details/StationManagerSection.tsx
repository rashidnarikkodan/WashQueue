import React, { useState, useEffect } from "react"
import type { Station } from "../../types"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { managerApi } from "@/shared/apis/manager.api"
import type { ManagerListItem, ManagerInvitationItem } from "@/shared/apis/manager.api"
import { InviteManagerModal } from "@/features/owner/components/InviteManagerModal"
import { UpdatePermissionsModal } from "@/features/owner/components/UpdatePermissionsModal"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { toast } from "sonner"
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  Building2,
  Mail,
  AlertCircle,
  Loader2,
  Settings2,
  Ban,
  Trash2,
  RefreshCw,
  XCircle,
  Crown,
} from "lucide-react"

interface StationManagerSectionProps {
  station: Station
  onRefresh: () => Promise<void>
  isOwner?: boolean
}

export const StationManagerSection: React.FC<StationManagerSectionProps> = ({
  station,
  onRefresh,
  isOwner = true,
}) => {
  const user = useAuthStore((state) => state.user)

  const [loading, setLoading] = useState(false)
  const [managerAssignment, setManagerAssignment] = useState<ManagerListItem | null>(null)
  const [pendingInvitation, setPendingInvitation] = useState<ManagerInvitationItem | null>(null)

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    confirmVariant: "danger" | "warning" | "primary" | "success"
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmVariant: "primary",
    onConfirm: async () => {},
  })

  const loadManagerData = async () => {
    if (!station?.id || !isOwner) return
    try {
      setLoading(true)
      const [mgrRes, invRes] = await Promise.all([
        managerApi.getOwnerManagers({ stationId: station.id }),
        managerApi.getOwnerInvitations(),
      ])

      const assigned = (mgrRes.managers || []).find((m) => m.stationId === station.id) || null
      const pending =
        (invRes || []).find((inv) => inv.stationId === station.id && inv.status === "PENDING") ||
        null

      setManagerAssignment(assigned)
      setPendingInvitation(pending)
    } catch {
      // Failed to load manager assignment or pending invitations
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!station?.id || !isOwner) return
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const [mgrRes, invRes] = await Promise.all([
          managerApi.getOwnerManagers({ stationId: station.id }),
          managerApi.getOwnerInvitations(),
        ])

        if (!isMounted) return
        const assigned = (mgrRes.managers || []).find((m) => m.stationId === station.id) || null
        const pending =
          (invRes || []).find((inv) => inv.stationId === station.id && inv.status === "PENDING") ||
          null

        setManagerAssignment(assigned)
        setPendingInvitation(pending)
      } catch {
        // Failed to fetch manager assignments on load
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void Promise.resolve().then(async () => {
      if (!isMounted) return
      await fetchData()
    })

    return () => {
      isMounted = false
    }
  }, [station?.id, isOwner])

  if (!isOwner) return null

  const isSelfManager =
    station.managerId === user?.id ||
    (managerAssignment && managerAssignment.managerUserId === user?.id)

  const handleSelfAssign = async () => {
    try {
      setIsSubmittingAction(true)
      await managerApi.selfAssignManager(station.id)
      await loadManagerData()
      await onRefresh()
      toast.success("Assigned yourself as manager for this station!")
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(
        errorObj?.response?.data?.message || errorObj?.message || "Failed to self-assign as manager"
      )
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleRemoveManager = () => {
    if (!managerAssignment) return
    const targetAssignment = managerAssignment
    setConfirmModal({
      isOpen: true,
      title: "Remove Station Manager",
      message: `Are you sure you want to remove manager assignment for "${managerAssignment.managerName || managerAssignment.managerEmail}"?`,
      confirmText: "Remove Manager",
      confirmVariant: "danger",
      onConfirm: async () => {
        setIsSubmittingAction(true)
        try {
          setManagerAssignment(null)
          await managerApi.removeManager(targetAssignment.assignmentId)
          toast.success("Station manager removed successfully")
        } catch (err: unknown) {
          const errorObj = err as { response?: { data?: { message?: string } } }
          setManagerAssignment(targetAssignment)
          toast.error(errorObj?.response?.data?.message || "Failed to remove manager")
        } finally {
          setIsSubmittingAction(false)
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  const handleToggleSuspend = () => {
    if (!managerAssignment) return
    const isSuspended = managerAssignment.status === "SUSPENDED"
    const targetStatus = isSuspended ? "ACTIVE" : "SUSPENDED"
    setConfirmModal({
      isOpen: true,
      title: isSuspended ? "Reactivate Manager" : "Suspend Manager",
      message: `Are you sure you want to ${isSuspended ? "reactivate" : "suspend"} manager "${managerAssignment.managerName || managerAssignment.managerEmail}"?`,
      confirmText: isSuspended ? "Reactivate" : "Suspend",
      confirmVariant: isSuspended ? "success" : "warning",
      onConfirm: async () => {
        setIsSubmittingAction(true)
        try {
          setManagerAssignment((prev) => (prev ? { ...prev, status: targetStatus } : null))
          if (isSuspended) {
            await managerApi.reactivateManager(managerAssignment.assignmentId)
            toast.success("Manager reactivated successfully")
          } else {
            await managerApi.suspendManager(managerAssignment.assignmentId)
            toast.success("Manager suspended successfully")
          }
        } catch (err: unknown) {
          const errorObj = err as { response?: { data?: { message?: string } } }
          setManagerAssignment((prev) =>
            prev ? { ...prev, status: managerAssignment.status } : null
          )
          toast.error(errorObj?.response?.data?.message || "Failed to update manager status")
        } finally {
          setIsSubmittingAction(false)
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  const handleCancelInvitation = () => {
    if (!pendingInvitation) return
    const targetInvitation = pendingInvitation
    setConfirmModal({
      isOpen: true,
      title: "Cancel Manager Invitation",
      message: `Are you sure you want to cancel invitation sent to ${pendingInvitation.email}?`,
      confirmText: "Cancel Invitation",
      confirmVariant: "danger",
      onConfirm: async () => {
        setIsSubmittingAction(true)
        try {
          setPendingInvitation(null)
          await managerApi.cancelInvitation(targetInvitation.id)
          toast.success("Invitation cancelled successfully")
        } catch (err: unknown) {
          const errorObj = err as { response?: { data?: { message?: string } } }
          setPendingInvitation(targetInvitation)
          toast.error(errorObj?.response?.data?.message || "Failed to cancel invitation")
        } finally {
          setIsSubmittingAction(false)
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  const handleResendInvitation = async () => {
    if (!pendingInvitation) return
    try {
      setIsSubmittingAction(true)
      await managerApi.resendInvitation(pendingInvitation.id)
      toast.success(`Invitation email resent to ${pendingInvitation.email}!`)
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      toast.error(errorObj?.response?.data?.message || "Failed to resend invitation")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-xl space-y-6 text-foreground relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Station Manager</h2>
            <p className="text-xs text-muted-foreground">
              Oversee bay operations and live queue for this station
            </p>
          </div>
        </div>

        {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
      </div>

      {managerAssignment ? (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-base">
                  {managerAssignment.managerName || "Station Manager"}
                </span>
                {isSelfManager && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/20 text-primary border border-primary/30">
                    <Crown className="w-3 h-3" />
                    You (Owner)
                  </span>
                )}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    managerAssignment.status === "ACTIVE"
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-warning/10 text-warning border-warning/30"
                  }`}
                >
                  {managerAssignment.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{managerAssignment.managerEmail}</span>
                {managerAssignment.managerPhone && <span>• {managerAssignment.managerPhone}</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsEditPermissionsModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5 cursor-pointer border border-border"
              >
                <Settings2 className="w-3.5 h-3.5 text-primary" />
                <span>Permissions</span>
              </button>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-semibold text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              {!isSelfManager && (
                <>
                  <button
                    onClick={handleToggleSuspend}
                    disabled={isSubmittingAction}
                    className="p-2 rounded-xl bg-warning/10 hover:bg-warning/20 text-warning transition-colors cursor-pointer disabled:opacity-50"
                    title={
                      managerAssignment.status === "SUSPENDED"
                        ? "Reactivate Manager"
                        : "Suspend Manager"
                    }
                  >
                    <Ban className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleRemoveManager}
                    disabled={isSubmittingAction}
                    className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove Manager Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {managerAssignment.permissions && managerAssignment.permissions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Granted Operational Permissions ({managerAssignment.permissions.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {managerAssignment.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border"
                  >
                    {perm.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : pendingInvitation ? (
        <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-warning text-sm">Invitation Pending</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning/20 text-warning border border-warning/40">
                  Awaiting Acceptance
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-warning/80">
                <Mail className="w-3.5 h-3.5" />
                <span>
                  Invited: <strong>{pendingInvitation.email}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {pendingInvitation.token && (
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/accept-invitation?token=${pendingInvitation.token}`
                    navigator.clipboard.writeText(link)
                    toast.success("Invitation link copied to clipboard!")
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Copy Link</span>
                </button>
              )}

              <button
                onClick={handleResendInvitation}
                disabled={isSubmittingAction}
                className="px-3 py-1.5 rounded-xl bg-warning/20 hover:bg-warning/30 text-warning font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Email</span>
              </button>

              <button
                onClick={handleCancelInvitation}
                disabled={isSubmittingAction}
                className="px-3 py-1.5 rounded-xl bg-destructive/20 hover:bg-destructive/30 text-destructive font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-muted/40 border border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-warning" />
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-foreground">No Manager Assigned</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each station requires a manager to control live queue status and process booking
              arrivals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              disabled={isSubmittingAction}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Manager</span>
            </button>

            <button
              onClick={handleSelfAssign}
              disabled={Boolean(isSubmittingAction || isSelfManager)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Building2 className="w-4 h-4 text-primary" />
              <span>Assign Myself</span>
            </button>
          </div>
        </div>
      )}

      <InviteManagerModal
        isOpen={isInviteModalOpen}
        stationId={station.id}
        stationName={station.name}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={async () => {
          await loadManagerData()
          await onRefresh()
        }}
      />

      {managerAssignment && (
        <UpdatePermissionsModal
          isOpen={isEditPermissionsModalOpen}
          manager={managerAssignment}
          onClose={() => setIsEditPermissionsModalOpen(false)}
          onSuccess={async () => {
            await loadManagerData()
            await onRefresh()
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        isLoading={isSubmittingAction}
      />
    </div>
  )
}
