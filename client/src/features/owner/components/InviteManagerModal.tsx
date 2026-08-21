import React, { useState, useEffect } from "react"
import { managerApi } from "@/shared/apis/manager.api"
import type { ManagerPermission } from "@/shared/apis/manager.api"
import { toast } from "sonner"
import {
  UserPlus,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Info,
  Sparkles,
  Building2,
} from "lucide-react"

interface InviteManagerModalProps {
  isOpen: boolean
  stationId: string
  stationName?: string
  onClose: () => void
  onSuccess: () => void
}

const ALL_PERMISSIONS: {
  id: ManagerPermission
  label: string
  description: string
  badge: string
}[] = [
  {
    id: "BOOKING_MANAGEMENT",
    label: "Booking Management",
    description: "Manage bookings, schedules & slots",
    badge: "Bookings",
  },
  {
    id: "QUEUE_MANAGEMENT",
    label: "Queue Management",
    description: "Real-time bay & queue control",
    badge: "Queue",
  },
  {
    id: "CUSTOMER_MANAGEMENT",
    label: "Customer Management",
    description: "Access customer details & logs",
    badge: "Customers",
  },
  {
    id: "PRICING_MANAGEMENT",
    label: "Pricing & Services",
    description: "Update rates & extra wash services",
    badge: "Pricing",
  },
  {
    id: "REPORTS_VIEW",
    label: "Reports & Analytics",
    description: "View revenue & operational metrics",
    badge: "Reports",
  },
  {
    id: "STATION_SETTINGS",
    label: "Station Settings",
    description: "Configure hours & bays setup",
    badge: "Settings",
  },
]

export const InviteManagerModal: React.FC<InviteManagerModalProps> = ({
  isOpen,
  stationId,
  stationName,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [selectedPermissions, setSelectedPermissions] = useState<ManagerPermission[]>([
    "BOOKING_MANAGEMENT",
    "QUEUE_MANAGEMENT",
    "REPORTS_VIEW",
  ])
  const [loading, setLoading] = useState<boolean>(false)
  const [isSuccessState, setIsSuccessState] = useState<boolean>(false)
  const [successResultMsg, setSuccessResultMsg] = useState<string>("")
  const [createdToken, setCreatedToken] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setIsSuccessState(false)
        setEmail("")
        setName("")
        setCreatedToken("")
      })
    }
  }, [isOpen])

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
    if (!stationId) {
      toast.error("Invalid station context")
      return
    }
    if (!email) {
      toast.error("Please enter an email address")
      return
    }

    try {
      setLoading(true)
      const res = await managerApi.inviteManager({
        email,
        name: name || undefined,
        stationId,
        permissions: selectedPermissions,
      })

      if (res.invitation?.token) {
        setCreatedToken(res.invitation.token)
      }
      setSuccessResultMsg(res.message || "Invitation sent successfully!")
      setIsSuccessState(true)
      onSuccess()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      toast.error(errorObj?.response?.data?.message || "Failed to send invitation")
    } finally {
      setLoading(false)
    }
  }

  const handleDone = () => {
    setEmail("")
    setName("")
    setIsSuccessState(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-[560px] md:max-w-[620px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden text-foreground relative flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-border bg-card/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              {isSuccessState ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                {isSuccessState ? "Invitation Sent" : "Invite Station Manager"}
              </h2>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                {isSuccessState
                  ? "Manager assignment / invitation registered"
                  : `Assign a manager for ${stationName || "this station"}`}
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

        {/* Modal Content Body */}
        {isSuccessState ? (
          /* SUCCESS STATE MODAL */
          <div className="px-6 sm:px-8 py-8 flex flex-col items-center text-center gap-6 my-auto overflow-y-auto">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-success/15 border-2 border-success flex items-center justify-center text-success shadow-xl shadow-success/20 animate-bounce-short">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border border-success/40 text-success">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">Success!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{successResultMsg}</p>
            </div>

            {/* Summary Box */}
            <div className="w-full bg-muted/40 p-4 sm:p-5 rounded-2xl text-left text-xs sm:text-sm space-y-3 border border-border">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground font-medium">Invited Email</span>
                <span className="font-semibold text-primary truncate max-w-[220px]">{email}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground font-medium">Station</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {stationName || "Target Station"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Permissions</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30">
                  {selectedPermissions.length} Granted
                </span>
              </div>
            </div>

            {createdToken && (
              <button
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}/accept-invitation?token=${createdToken}`
                  navigator.clipboard.writeText(link)
                  toast.success("Invitation link copied to clipboard!")
                }}
                className="w-full py-3 px-4 rounded-xl bg-muted hover:bg-muted/70 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-primary/30"
              >
                <span>Copy Direct Invitation Link</span>
              </button>
            )}

            <button
              onClick={handleDone}
              className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              Done & Return to Station
            </button>
          </div>
        ) : (
          /* INVITE FORM MODAL */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 sm:px-8 py-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              {/* Station Badge Header */}
              {stationName && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Inviting manager for: <strong className="text-foreground">{stationName}</strong>
                  </span>
                </div>
              )}

              {/* Grid Layout for Email & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    placeholder="manager@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>

                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>Manager Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Permissions Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Assign Permissions</span>
                  </label>
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
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

              {/* Helper Text Container */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground leading-relaxed flex items-start gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  An invitation email will be sent to{" "}
                  <span className="text-primary font-semibold">{email || "this email"}</span>.
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Rule: Each station can have only 1 manager.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-border bg-card/70 shrink-0">
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Invitation</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
