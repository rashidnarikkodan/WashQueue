import React, { useState, useEffect } from "react"
import { managerApi } from "@/shared/apis/manager.api"
import type { ManagerListItem, ManagerPermission } from "@/shared/apis/manager.api"
import { toast } from "sonner"
import { ShieldCheck, X, Loader2 } from "lucide-react"

interface UpdatePermissionsModalProps {
  isOpen: boolean
  manager: ManagerListItem | null
  onClose: () => void
  onSuccess: () => void
}

const ALL_PERMISSIONS: {
  id: ManagerPermission
  label: string
  description: string
}[] = [
  {
    id: "BOOKING_MANAGEMENT",
    label: "Booking Management",
    description: "Manage bookings & schedules",
  },
  {
    id: "QUEUE_MANAGEMENT",
    label: "Queue Management",
    description: "Real-time bay & queue control",
  },
  {
    id: "CUSTOMER_MANAGEMENT",
    label: "Customer Management",
    description: "Access customer details",
  },
  {
    id: "PRICING_MANAGEMENT",
    label: "Pricing & Services",
    description: "Update rates & extra wash services",
  },
  {
    id: "REPORTS_VIEW",
    label: "Reports & Analytics",
    description: "View revenue & operational metrics",
  },
  {
    id: "STATION_SETTINGS",
    label: "Station Settings",
    description: "Configure hours & bays setup",
  },
]

export const UpdatePermissionsModal: React.FC<UpdatePermissionsModalProps> = ({
  isOpen,
  manager,
  onClose,
  onSuccess,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<ManagerPermission[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (manager) {
      queueMicrotask(() => setSelectedPermissions(manager.permissions || []))
    }
  }, [manager])

  if (!isOpen || !manager) return null

  const togglePermission = (permId: ManagerPermission) => {
    if (selectedPermissions.includes(permId)) {
      if (selectedPermissions.length === 1) {
        toast.warning("At least one permission is required")
        return
      }
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId))
    } else {
      setSelectedPermissions([...selectedPermissions, permId])
    }
  }

  const selectAllPermissions = () => {
    setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await managerApi.updatePermissions(manager.assignmentId, selectedPermissions)
      toast.success("Manager permissions updated successfully")
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      toast.error(errorObj?.response?.data?.message || "Failed to update permissions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-[560px] md:max-w-[600px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden text-foreground relative flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-border bg-card/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                Update Manager Permissions
              </h2>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                {manager.managerName || manager.managerEmail} •{" "}
                <span className="text-primary">{manager.stationName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Manager Access Permissions</span>
              </label>
              <button
                type="button"
                onClick={selectAllPermissions}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.id)
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`flex items-start justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                      isChecked
                        ? "bg-primary/10 border-primary/50 text-primary shadow-sm"
                        : "bg-muted/40 border-border text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <p className="font-bold text-foreground text-xs">{perm.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {perm.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-border accent-primary pointer-events-none"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Permissions</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
