import React, { useState, useEffect } from "react"
import { stationApi } from "@/shared/apis/station.api"
import type { Station } from "@/features/station/types"
import { managerApi } from "@/shared/apis/manager.api"
import type { ManagerPermission } from "@/shared/apis/manager.api"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { toast } from "sonner"
import {
  UserPlus,
  Building2,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Info,
  Sparkles,
} from "lucide-react"

interface InviteManagerModalProps {
  isOpen: boolean
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
  onClose,
  onSuccess,
}) => {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStationId, setSelectedStationId] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [selectedPermissions, setSelectedPermissions] = useState<ManagerPermission[]>([
    "BOOKING_MANAGEMENT",
    "QUEUE_MANAGEMENT",
    "REPORTS_VIEW",
  ])
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchingStations, setFetchingStations] = useState<boolean>(false)
  const [isSuccessState, setIsSuccessState] = useState<boolean>(false)
  const [successResultMsg, setSuccessResultMsg] = useState<string>("")

  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (isOpen) {
      setIsSuccessState(false)
      fetchOwnerStations()
    }
  }, [isOpen, user])

  const fetchOwnerStations = async () => {
    try {
      setFetchingStations(true)
      const ownerUserId = user?.ownerId || user?.id
      if (!ownerUserId) {
        setStations([])
        return
      }
      const res = await stationApi.getStations({
        ownerId: ownerUserId,
        limit: 100,
        status: "all",
      })
      const list = res.stations || []
      setStations(list)
      if (list.length > 0) {
        setSelectedStationId(list[0].id)
      } else {
        setSelectedStationId("")
      }
    } catch {
      toast.error("Failed to fetch your stations")
    } finally {
      setFetchingStations(false)
    }
  }

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

  const selectedStation = stations.find((s) => s.id === selectedStationId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStationId) {
      toast.error("Please select a station from your stations")
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
        stationId: selectedStationId,
        permissions: selectedPermissions,
      })

      setSuccessResultMsg(res.message || "Invitation sent successfully!")
      setIsSuccessState(true)
      onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send invitation")
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
      <div
        className="w-full max-w-[560px] md:max-w-[620px] bg-[#191F31] border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden text-[#DCE1FB] relative flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.65)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-slate-800/80 bg-[#151B2D]/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ADC6FF]/10 border border-[#ADC6FF]/20 flex items-center justify-center text-[#ADC6FF] shrink-0">
              {isSuccessState ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {isSuccessState ? "Invitation Sent" : "Invite Station Manager"}
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                {isSuccessState
                  ? "Manager assignment / invitation has been registered"
                  : "Assign a dedicated manager to oversee one of your stations"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#C2C6D6] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        {isSuccessState ? (
          /* SUCCESS STATE MODAL WITH GREEN TICK */
          <div className="px-6 sm:px-8 py-8 flex flex-col items-center text-center gap-6 my-auto overflow-y-auto">
            {/* Green Tick Circle */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce-short">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#191F31] border border-emerald-500/40 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-2xl font-bold text-white tracking-tight">Success!</h3>
              <p className="text-sm text-[#C2C6D6] leading-relaxed">
                {successResultMsg}
              </p>
            </div>

            {/* Summary Box */}
            <div className="w-full bg-[#070D1F] p-4 sm:p-5 rounded-2xl text-left text-xs sm:text-sm space-y-3 border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[#8C909F] font-medium">Invited Email</span>
                <span className="font-semibold text-[#ADC6FF] truncate max-w-[220px]">{email}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[#8C909F] font-medium">Your Station</span>
                <span className="font-semibold text-white truncate max-w-[220px]">
                  {selectedStation?.name || "Selected Station"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C909F] font-medium">Permissions</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {selectedPermissions.length} Granted
                </span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full py-3.5 px-6 rounded-xl bg-[#ADC6FF] text-[#002E6A] font-bold text-sm hover:bg-[#92b5ff] transition-all shadow-lg active:scale-98 cursor-pointer mt-2"
            >
              Done & Return to Team
            </button>
          </div>
        ) : (
          /* INVITE FORM MODAL */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 sm:px-8 py-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              {/* Select Station Input Group */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#C2C6D6] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#ADC6FF]" />
                    Select Your Station
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Only stations owned by you</span>
                </label>
                <div className="relative">
                  {fetchingStations ? (
                    <div className="w-full px-4 py-3 rounded-xl bg-[#070D1F] border border-slate-700/50 text-xs text-slate-400 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#ADC6FF]" />
                      <span>Loading your stations...</span>
                    </div>
                  ) : stations.length === 0 ? (
                    <div className="w-full px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                      No stations found under your profile. Please add a station first before assigning a manager.
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedStationId}
                        onChange={(e) => setSelectedStationId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#070D1F] border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ADC6FF]/40 focus:border-[#ADC6FF] transition-all cursor-pointer appearance-none"
                      >
                        {stations.map((s) => (
                          <option key={s.id} value={s.id} className="bg-[#191F31] text-white">
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Grid Layout for Email & Name on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#C2C6D6] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#ADC6FF]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    placeholder="manager@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#070D1F] border border-slate-700/50 text-sm text-white placeholder-[#8C909F] focus:outline-none focus:ring-2 focus:ring-[#ADC6FF]/40 focus:border-[#ADC6FF] transition-all"
                  />
                </div>

                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#C2C6D6] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#ADC6FF]" />
                    <span>Manager Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#070D1F] border border-slate-700/50 text-sm text-white placeholder-[#8C909F] focus:outline-none focus:ring-2 focus:ring-[#ADC6FF]/40 focus:border-[#ADC6FF] transition-all"
                  />
                </div>
              </div>

              {/* Permissions Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#C2C6D6] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ADC6FF]" />
                    <span>Assign Permissions</span>
                  </label>
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="text-xs font-semibold text-[#ADC6FF] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                </div>

                {/* Responsive 2-Column Grid on Tablet/Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id)
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-start justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                          isChecked
                            ? "bg-[#ADC6FF]/10 border-[#ADC6FF]/50 text-[#ADC6FF] shadow-sm"
                            : "bg-[#070D1F]/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <p className="font-bold text-white text-xs">{perm.label}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">{perm.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-slate-700 accent-[#ADC6FF] pointer-events-none"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Helper Text Container */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#151B2D] border border-slate-800 text-xs text-[#C2C6D6] leading-relaxed flex items-start gap-3">
                <Info className="w-4 h-4 text-[#ADC6FF] shrink-0 mt-0.5" />
                <div>
                  We'll send an invitation email to <span className="text-[#ADC6FF] font-semibold">{email || "this email"}</span>.
                  They will be granted manager access for{" "}
                  <span className="text-white font-semibold">
                    {selectedStation?.name || "your station"}
                  </span>.
                  <p className="mt-1 text-[11px] text-slate-400">
                    Rule: Each manager can only be assigned to one station, and each station can only have one manager.
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center pt-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-700/50 bg-[#2E3447] text-xs font-semibold text-[#DCE1FB] shadow-inner">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ADC6FF]" />
                  <span>Role: Manager</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-slate-800 bg-[#151B2D]/70 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#ADC6FF] hover:bg-[#ADC6FF]/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || stations.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ADC6FF] text-[#002E6A] font-bold text-sm hover:bg-[#92b5ff] transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
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
