import { useState } from "react"
import { X, UserPlus, Store, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface SelectManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onAssignManager: (input: { managerType: "SELF" | "INVITE"; email?: string }) => Promise<void>
  isCurrentManagerSelf?: boolean
}

export function SelectManagerModal({
  isOpen,
  onClose,
  onAssignManager,
  isCurrentManagerSelf = false,
}: SelectManagerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<"SELF" | "INVITE" | null>(null)

  if (!isOpen) return null

  const handleAssignClick = async (managerType: "SELF" | "INVITE", email?: string) => {
    try {
      setIsSubmitting(managerType)
      await onAssignManager({ managerType, email })
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || `Error setting manager (${managerType})`)
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[850px] bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 overflow-hidden text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/60 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Assign a Manager for this Station
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-normal">
            How would you like to set Manager?
          </p>
        </div>

        {/* 2 Option Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Invite a new Manager */}
          <div className="bg-[#020617] border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-6 flex flex-col items-center justify-between text-center transition-all group min-h-[340px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-5 group-hover:scale-105 transition-transform">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Invite a new Manager
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-6">
                Invite a dedicated station manager to oversee booking appointments and manage day-to-day queue operations.
              </p>
            </div>

            <button
              onClick={() => handleAssignClick("INVITE")}
              disabled={isSubmitting !== null}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting === "INVITE" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Invite a manager</span>
              )}
            </button>
          </div>

          {/* Card 2: Assign Yourself as Manager */}
          <div className="bg-[#020617] border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-6 flex flex-col items-center justify-between text-center transition-all group min-h-[340px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-5 group-hover:scale-105 transition-transform">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Assign Yourself as Manager
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-6">
                You will manage all of your station's booking, queue management, and live service operations directly.
              </p>
            </div>

            <button
              onClick={() => handleAssignClick("SELF")}
              disabled={isSubmitting !== null || isCurrentManagerSelf}
              className={`w-full py-3 px-4 font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 ${
                isCurrentManagerSelf
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "border border-blue-500 hover:bg-blue-500/10 text-blue-400"
              }`}
            >
              {isSubmitting === "SELF" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Assigning...</span>
                </>
              ) : isCurrentManagerSelf ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Assigned to You</span>
                </>
              ) : (
                <span>I will Manage this Station</span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Note Box */}
        <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-xs font-medium text-blue-400/90 leading-relaxed">
            <strong className="font-bold">Station Rules:</strong> 1. Each station can have only 1 manager, and a manager can only manage 1 station. 2. Station owners can directly manage the queue of only 1 station. If you operate multiple stations, you must assign dedicated managers to your other stations.
          </p>
        </div>
      </div>
    </div>
  )
}
