import React, { useState, useEffect, useCallback } from "react"
import type { Station } from "../../types"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { stationApi } from "@/shared/apis/station.api"
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

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  // Confirmation Modal State
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

  const loadManagerData = useCallback(async () => {
    if (!station?.id || !isOwner) return
    try {
      setLoading(true)
      const [mgrRes, invRes] = await Promise.all([
        managerApi.getOwnerManagers({ stationId: station.id }),
        managerApi.getOwnerInvitations(),
      ])

      const assigned = (mgrRes.managers || []).find((m) => m.stationId === station.id) || null
      const pending = (invRes || []).find(
        (inv) => inv.stationId === station.id && inv.status === "PENDING"
      ) || null

      setManagerAssignment(assigned)
      setPendingInvitation(pending)
    } catch {
      // Quiet fail if missing manager context
    } finally {
      setLoading(false)
    }
  }, [station?.id, isOwner])

  useEffect(() => {
    loadManagerData()
  }, [loadManagerData])

  if (!isOwner) return null

  // Helper check if owner is self manager
  const isSelfManager = station.managerId === user?.id || (managerAssignment && managerAssignment.managerUserId === user?.id)

  // Action: Self Assign
  const handleSelfAssign = async () => {
    try {
      setIsSubmittingAction(true)
      await stationApi.assignManager(station.id, { managerType: "SELF" })
      toast.success("Assigned yourself as manager for this station!")
      await loadManagerData()
      await onRefresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to self-assign as manager")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  // Action: Remove Manager
  const handleRemoveManager = () => {
    if (!managerAssignment) return
    setConfirmModal({
      isOpen: true,
      title: "Remove Station Manager",
      message: `Are you sure you want to remove manager assignment for "${managerAssignment.managerName || managerAssignment.managerEmail}"?`,
      confirmText: "Remove Manager",
      confirmVariant: "danger",
      onConfirm: async () => {
        setIsSubmittingAction(true)
        try {
          await managerApi.removeManager(managerAssignment.assignmentId)
          toast.success("Station manager removed successfully")
          await loadManagerData()
          await onRefresh()
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Failed to remove manager")
        } finally {
          setIsSubmittingAction(false)
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  // Action: Suspend / Reactivate Manager
  const handleToggleSuspend = () => {
    if (!managerAssignment) return
    const isSuspended = managerAssignment.status === "SUSPENDED"
    setConfirmModal({
      isOpen: true,
      title: isSuspended ? "Reactivate Manager" : "Suspend Manager",
      message: `Are you sure you want to ${isSuspended ? "reactivate" : "suspend"} manager "${managerAssignment.managerName || managerAssignment.managerEmail}"?`,
      confirmText: isSuspended ? "Reactivate" : "Suspend",
      confirmVariant: isSuspended ? "success" : "warning",
      onConfirm: async () => {
        setIsSubmittingAction(true)
        try {
          if (isSuspended) {
            await managerApi.reactivateManager(managerAssignment.assignmentId)
            toast.success("Manager reactivated successfully")
          } else {
            await managerApi.suspendManager(managerAssignment.assignmentId)
            toast.success("Manager suspended successfully")
          }
          await loadManagerData()
          await onRefresh()
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Failed to update manager status")
        } finally {
          setIsSubmittingAction(false)
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  // Action: Cancel Pending Invitation
  const handleCancelInvitation = () => {
    if (!pendingInvitation) return
    setConfirmModal({
      isOpen: true,
      title: "Cancel Manager Invitation",
      message: `Are you sure you want to cancel invitation sent to ${pendingInvitation.email}?`,
      confirmText: "Cancel Invitation",
      confirmVariant: "danger",
      onConfirm: async () => {
        setIsSubmittingAction(true)
        try {
          await managerApi.cancelInvitation(pendingInvitation.id)
          toast.success("Invitation cancelled successfully")
          await loadManagerData()
          await onRefresh()
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Failed to cancel invitation")
        } finally {
          setIsSubmittingAction(false)
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  // Action: Resend Pending Invitation
  const handleResendInvitation = async () => {
    if (!pendingInvitation) return
    try {
      setIsSubmittingAction(true)
      await managerApi.resendInvitation(pendingInvitation.id)
      toast.success(`Invitation email resent to ${pendingInvitation.email}!`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend invitation")
    } finally {
      setIsSubmittingAction(false)
    }
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#191F31] border border-slate-800 shadow-xl space-y-6 text-[#DCE1FB] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ADC6FF]/10 border border-[#ADC6FF]/20 flex items-center justify-center text-[#ADC6FF]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Station Manager</h2>
            <p className="text-xs text-slate-400">Oversee bay operations and live queue for this station</p>
          </div>
        </div>

        {loading && <Loader2 className="w-5 h-5 animate-spin text-[#ADC6FF]" />}
      </div>

      {/* STATE 1: ACTIVE MANAGER ASSIGNED */}
      {managerAssignment ? (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-[#070D1F] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">
                  {managerAssignment.managerName || "Station Manager"}
                </span>
                {isSelfManager && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <Crown className="w-3 h-3" />
                    You (Owner)
                  </span>
                )}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    managerAssignment.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {managerAssignment.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{managerAssignment.managerEmail}</span>
                {managerAssignment.managerPhone && (
                  <span>• {managerAssignment.managerPhone}</span>
                )}
              </div>
            </div>

            {/* Action Buttons for Assigned Manager */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsEditPermissionsModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-[#ADC6FF]" />
                <span>Permissions</span>
              </button>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              {!isSelfManager && (
                <>
                  <button
                    onClick={handleToggleSuspend}
                    disabled={isSubmittingAction}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
                    title={managerAssignment.status === "SUSPENDED" ? "Reactivate Manager" : "Suspend Manager"}
                  >
                    <Ban className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleRemoveManager}
                    disabled={isSubmittingAction}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove Manager Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Manager Granted Permissions List */}
          {managerAssignment.permissions && managerAssignment.permissions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ADC6FF]" />
                Granted Operational Permissions ({managerAssignment.permissions.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {managerAssignment.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-cyan-300 border border-slate-800"
                  >
                    {perm.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : pendingInvitation ? (
        /* STATE 2: PENDING INVITATION */
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-200 text-sm">Invitation Pending</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Awaiting Acceptance
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-300/80">
                <Mail className="w-3.5 h-3.5" />
                <span>Invited: <strong>{pendingInvitation.email}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResendInvitation}
                disabled={isSubmittingAction}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Email</span>
              </button>

              <button
                onClick={handleCancelInvitation}
                disabled={isSubmittingAction}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 3: NO MANAGER ASSIGNED */
        <div className="p-6 rounded-2xl bg-[#070D1F] border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-white">No Manager Assigned</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each station requires a manager to control live queue status and process booking arrivals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              disabled={isSubmittingAction}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ADC6FF] text-[#002E6A] font-bold text-xs hover:bg-[#92b5ff] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Manager</span>
            </button>

            <button
              onClick={handleSelfAssign}
              disabled={Boolean(isSubmittingAction || isSelfManager)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Assign Myself</span>
            </button>
          </div>
        </div>
      )}

      {/* Invite Manager Modal */}
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

      {/* Update Permissions Modal */}
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

      {/* Confirmation Modal */}
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
