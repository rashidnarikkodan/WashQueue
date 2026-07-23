import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import Loading from "@/shared/components/ui/Loading"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useStationStore } from "../store/stationStore"
import { useAuthStore } from "@/features/auth/store/authStore"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
import { STATION_STATUS } from "../types"
import { StationHeroGallery } from "../components/station-details/StationHeroGallery"
import { StationAboutSection } from "../components/station-details/StationAboutSection"
import { StationPricingSection } from "../components/station-details/StationPricingSection"
import { StationExtraServicesSection } from "../components/station-details/StationExtraServicesSection"
import { StationLiveQueueSection } from "../components/station-details/StationLiveQueueSection"
import { StationReviewsSection } from "../components/station-details/StationReviewsSection"
import { StationQASection } from "../components/station-details/StationQASection"
import { StationLocationSection } from "../components/station-details/StationLocationSection"
import { StationSidebarCard } from "../components/station-details/StationSidebarCard"

// Modular Details Components

interface CommonStationDetailProps {
  role?: RoleType
}

export function StationDetails({ role }: CommonStationDetailProps) {
  const params = useParams<{ id?: string; stationId?: string }>()
  const id = params.id || params.stationId
  const navigate = useNavigate()

  const {
    selectedStation,
    isLoading,
    fetchStationById,
    reviewStation,
    deleteStation,
    toggleActiveStation,
    clearSelected,
  } = useStationStore()
  const user = useAuthStore((state) => state.user)

  // Resolve role from props or auth store
  let currentRole = role
  if (!role && user) {
    if (user.role === ROLE.ADMIN) currentRole = ROLE.ADMIN
    else if (user.role === ROLE.OWNER) currentRole = ROLE.OWNER
  }

  const [rejecting, setRejecting] = useState(false)
  const [rejectionReasonInput, setRejectionReasonInput] = useState("")
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  // Confirmation Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
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

  useEffect(() => {
    if (id) {
      fetchStationById(id)
    }
    return () => clearSelected()
  }, [id, fetchStationById, clearSelected])

  if (isLoading || !selectedStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
        <Loading size="lg" />
        <p className="text-sm text-[#8c909f] font-medium animate-pulse">
          Loading Station Details &amp; Live Status…
        </p>
      </div>
    )
  }

  const { station, pricing, extraServices } = selectedStation
  const isRejected = station.status === STATION_STATUS.REJECTED
  const isPending = station.status === STATION_STATUS.PENDING_REVIEW

  const handleApprove = async () => {
    if (!id) return
    setIsSubmittingAction(true)
    try {
      const success = await reviewStation(id, "APPROVE")
      if (success) {
        await fetchStationById(id)
      }
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleReject = async () => {
    if (!id || !rejectionReasonInput.trim()) return
    setIsSubmittingAction(true)
    try {
      const success = await reviewStation(id, "REJECT", rejectionReasonInput.trim())
      if (success) {
        setRejecting(false)
        setRejectionReasonInput("")
        await fetchStationById(id)
      }
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleToggleActive = () => {
    if (!id || !selectedStation) return
    const currentActive = selectedStation.station.isActive
    const actionText = currentActive ? "deactivate" : "reactivate"
    setConfirmModalConfig({
      isOpen: true,
      title: `${currentActive ? "Deactivate" : "Reactivate"} Station`,
      message: `Are you sure you want to ${actionText} station "${selectedStation.station.name}"?`,
      confirmText: currentActive ? "Deactivate" : "Reactivate",
      confirmVariant: currentActive ? "warning" : "success",
      onConfirm: async () => {
        setIsSubmittingAction(true)
        try {
          await toggleActiveStation(id)
          await fetchStationById(id)
        } finally {
          setIsSubmittingAction(false)
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  const handleDeleteDraft = () => {
    if (!id || !selectedStation) return
    setConfirmModalConfig({
      isOpen: true,
      title: "Delete Station Draft",
      message: `Are you sure you want to delete draft station "${selectedStation.station.name}"? This action cannot be undone.`,
      confirmText: "Delete Draft",
      confirmVariant: "danger",
      onConfirm: async () => {
        setIsSubmittingAction(true)
        try {
          const success = await deleteStation(id)
          if (success) {
            setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))
            navigate("/owner/stations")
          }
        } finally {
          setIsSubmittingAction(false)
        }
      },
    })
  }

  const backPath =
    currentRole === ROLE.ADMIN
      ? "/admin/stations"
      : currentRole === ROLE.OWNER
        ? "/owner/stations"
        : "/stations"

  return (
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 space-y-8 text-left animate-in fade-in duration-300">
      {/* Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            {
              label: currentRole === "admin" ? "Admin" : currentRole === "owner" ? "Owner" : "Home",
              path: backPath,
            },
            { label: "Stations", path: backPath },
            { label: station.name },
          ]}
        />
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Stations</span>
        </button>
      </div>

      {/* Rejection Alert Banner */}
      {isRejected && station.rejectionReason && (
        <div className="p-5 border border-red-500/30 bg-red-500/10 rounded-2xl flex items-start gap-4 shadow-xl">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-red-300">Application Status: Rejected</h3>
            <p className="text-xs text-red-200/90 leading-relaxed">
              <strong>Reason:</strong> {station.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Pending Approval Notice Banner (Admin view) */}
      {currentRole === "admin" && isPending && (
        <div className="p-5 border border-amber-500/30 bg-amber-500/10 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-base font-extrabold text-amber-300">
                Station Verification Pending
              </h3>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Review operating hours, slot configs, pricing models, and amenities below before
                taking action.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleApprove}
              disabled={isSubmittingAction}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              Approve Station
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={isSubmittingAction}
              className="px-5 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              Reject Application
            </button>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT: 70% Left Column + 30% Right Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (70%) */}
        <div className="lg:col-span-8 space-y-12">
          <StationHeroGallery images={station.images} stationName={station.name} />

          <StationAboutSection stationName={station.name} description={station.description} />

          <StationPricingSection pricing={pricing} />

          <StationExtraServicesSection extraServices={extraServices} />

          {currentRole !== ROLE.ADMIN && <StationLiveQueueSection />}

          {currentRole === ROLE.CUSTOMER && (
            <>
              <StationReviewsSection rating={station.rating} reviewCount={station.reviewCount} />
              <StationQASection stationName={station.name} />
            </>
          )}
          {currentRole !== ROLE.ADMIN && (
            <StationLocationSection address={station.address} location={station.location} stationName={station.name} />
          )}
        </div>

        {/* Right Column (30%) - Sticky Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <StationSidebarCard
            station={station}
            role={currentRole}
            onApprove={handleApprove}
            onReject={() => setRejecting(true)}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteDraft}
            isSubmittingAction={isSubmittingAction}
          />
        </div>
      </div>

      {/* Custom Rejection Reason Input Modal */}
      {rejecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                  Reject Station Registration
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Specify feedback for the car wash partner
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Operating hours are invalid, or pricing entries contain negative figures. Please rectify..."
                className="w-full h-32 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-4 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/80 transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejecting(false)}
                className="flex-1 py-3 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionReasonInput.trim() || isSubmittingAction}
                onClick={handleReject}
                className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-500/10"
              >
                Reject Station
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        confirmVariant={confirmModalConfig.confirmVariant}
        isLoading={isSubmittingAction}
      />
    </div>
  )
}

export default StationDetails
