import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import Loading from "@/shared/components/ui/Loading"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import AuthRequiredModal from "@/shared/components/ui/AuthRequiredModal"
import { useStationStore } from "../store/station.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
import { STATION_STATUS } from "../types"
import { managerApi, type ManagerPermission } from "@/shared/apis/manager.api"
import { StationHeroGallery } from "../components/station-details/StationHeroGallery"
import { StationAboutSection } from "../components/station-details/StationAboutSection"
import { StationPricingSection } from "../components/station-details/StationPricingSection"
import { StationExtraServicesSection } from "../components/station-details/StationExtraServicesSection"
import { StationLiveQueueSection } from "../components/station-details/StationLiveQueueSection"
import { StationReviewsSection } from "../components/station-details/StationReviewsSection"
import { StationQASection } from "../components/station-details/StationQASection"
import { StationLocationSection } from "../components/station-details/StationLocationSection"
import { StationSidebarCard } from "../components/station-details/StationSidebarCard"
import { StationManagerSection } from "../components/station-details/StationManagerSection"

interface CommonStationDetailProps {
  role?: RoleType
}

export function StationDetails({ role }: CommonStationDetailProps) {
  const params = useParams<{ id?: string; stationId?: string }>()
  const id = params.id || params.stationId
  const navigate = useNavigate()
  const location = useLocation()

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

  const [managerPermissions, setManagerPermissions] = useState<ManagerPermission[]>([])
  const [noManagedStation, setNoManagedStation] = useState(false)

  let currentRole: RoleType = ROLE.CUSTOMER
  if (role) {
    currentRole = role
  } else if (location.pathname.startsWith("/admin") && user?.role === ROLE.ADMIN) {
    currentRole = ROLE.ADMIN
  } else if (location.pathname.startsWith("/owner") && user?.role === ROLE.OWNER) {
    currentRole = ROLE.OWNER
  } else if (location.pathname.startsWith("/manager") && user?.role === ROLE.MANAGER) {
    currentRole = ROLE.MANAGER
  } else {
    currentRole = ROLE.CUSTOMER
  }

  const [rejecting, setRejecting] = useState(false)
  const [rejectionReasonInput, setRejectionReasonInput] = useState("")
  const [suspending, setSuspending] = useState(false)
  const [suspensionReasonInput, setSuspensionReasonInput] = useState("")
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleBookNow = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    navigate(`/bookings/new?stationId=${id}`)
  }

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
    let isMounted = true

    async function initStation() {
      if (currentRole === ROLE.MANAGER) {
        try {
          const managedList = await managerApi.getManagedStations()
          if (!isMounted) return
          if (managedList && managedList.length > 0) {
            const targetId = id || managedList[0].stationId
            const activeAssignment =
              managedList.find((m) => m.stationId === targetId) || managedList[0]
            setManagerPermissions(activeAssignment.permissions || [])
            await fetchStationById(activeAssignment.stationId)
          } else {
            setNoManagedStation(true)
          }
        } catch {
          if (id) {
            await fetchStationById(id)
          } else {
            setNoManagedStation(true)
          }
        }
      } else if (id) {
        await fetchStationById(id)
      }
    }

    initStation()

    return () => {
      isMounted = false
      clearSelected()
    }
  }, [id, currentRole, fetchStationById, clearSelected])

  if (noManagedStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center text-warning">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-bold text-foreground">No Station Assigned</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your manager account is not currently assigned to any active station. Please ask the
            station owner to send you a manager invitation.
          </p>
        </div>
        <button
          onClick={() => navigate("/manager/dashboard")}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-md"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  if (isLoading || !selectedStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
        <Loading size="lg" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Loading Station Details &amp; Live Status…
        </p>
      </div>
    )
  }

  const { station, pricing, extraServices } = selectedStation
  const isRejected = station.status === STATION_STATUS.REJECTED
  const isSuspended = station.status === STATION_STATUS.SUSPENDED

  const handleApprove = async () => {
    if (!id) return
    setIsSubmittingAction(true)
    try {
      await reviewStation(id, "APPROVE")
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
      }
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleSuspend = async () => {
    if (!id) return
    setIsSubmittingAction(true)
    try {
      const success = await reviewStation(id, "SUSPEND", suspensionReasonInput.trim() || undefined)
      if (success) {
        setSuspending(false)
        setSuspensionReasonInput("")
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
        : currentRole === ROLE.MANAGER
          ? "/manager/dashboard"
          : "/stations"

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-32 space-y-4 sm:space-y-6 text-left animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            {
              label:
                currentRole === ROLE.ADMIN
                  ? "Admin"
                  : currentRole === ROLE.OWNER
                    ? "Owner"
                    : currentRole === ROLE.MANAGER
                      ? "Manager"
                      : "Home",
              path: backPath,
            },
            { label: "Stations", path: backPath },
            { label: station.name },
          ]}
        />
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Stations</span>
        </button>
      </div>

      {isRejected && station.rejectionReason && (
        <div className="p-5 border border-destructive/30 bg-destructive/10 rounded-2xl flex items-start gap-4 shadow-xl">
          <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-destructive">Application Status: Rejected</h3>
            <p className="text-xs text-destructive/90 leading-relaxed">
              <strong>Reason:</strong> {station.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="p-5 border border-warning/30 bg-warning/10 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-warning">Station Status: Suspended</h3>
              <p className="text-xs text-warning/90 leading-relaxed">
                This station has been suspended by an administrator.
                {station.rejectionReason && (
                  <>
                    <br />
                    <strong>Reason:</strong> {station.rejectionReason}
                  </>
                )}
              </p>
            </div>
          </div>
          {currentRole === ROLE.ADMIN && (
            <button
              onClick={handleApprove}
              disabled={isSubmittingAction}
              className="px-5 py-2.5 rounded-xl bg-success hover:opacity-90 text-success-foreground font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-success/20 disabled:opacity-50 shrink-0"
            >
              Reactivate Station
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-12">
          <StationHeroGallery images={station.images} stationName={station.name} />

          <StationAboutSection stationName={station.name} description={station.description} />

          <div className="block lg:hidden">
            <StationSidebarCard
              station={station}
              role={currentRole}
              managerPermissions={managerPermissions}
              onApprove={handleApprove}
              onReject={() => setRejecting(true)}
              onSuspend={() => setSuspending(true)}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteDraft}
              onBookNow={handleBookNow}
              onOpenAssignManager={() => {
                const el = document.getElementById("station-manager-section")
                if (el) el.scrollIntoView({ behavior: "smooth" })
              }}
              isSubmittingAction={isSubmittingAction}
            />
          </div>

          {currentRole === ROLE.OWNER && (
            <div id="station-manager-section">
              <StationManagerSection
                station={station}
                onRefresh={() => fetchStationById(id!)}
                isOwner={currentRole === ROLE.OWNER}
              />
            </div>
          )}

          <StationPricingSection pricing={pricing} />

          <StationExtraServicesSection extraServices={extraServices} />

          {currentRole !== ROLE.ADMIN && <StationLiveQueueSection stationId={station.id} />}

          {currentRole === ROLE.CUSTOMER && (
            <>
              <StationReviewsSection rating={station.rating} reviewCount={station.reviewCount} />
              <StationQASection stationName={station.name} />
            </>
          )}
          {currentRole !== ROLE.ADMIN && (
            <StationLocationSection
              address={station.address}
              location={station.location}
              stationName={station.name}
            />
          )}
        </div>

        <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24">
          <StationSidebarCard
            station={station}
            role={currentRole}
            managerPermissions={managerPermissions}
            onApprove={handleApprove}
            onReject={() => setRejecting(true)}
            onSuspend={() => setSuspending(true)}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteDraft}
            onBookNow={handleBookNow}
            onOpenAssignManager={() => {
              const el = document.getElementById("station-manager-section")
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
            isSubmittingAction={isSubmittingAction}
          />
        </div>
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground uppercase tracking-wider">
                  Reject Station Registration
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Specify feedback for the car wash partner
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Operating hours are invalid, or pricing entries contain negative figures. Please rectify..."
                className="w-full h-32 bg-background text-foreground border border-border rounded-xl p-4 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive/80 transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejecting(false)}
                className="flex-1 py-3 border border-border hover:bg-muted rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionReasonInput.trim() || isSubmittingAction}
                onClick={handleReject}
                className="flex-1 py-3 bg-destructive hover:opacity-90 text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-destructive/10"
              >
                Reject Station
              </button>
            </div>
          </div>
        </div>
      )}

      {suspending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 border border-warning/20 text-warning flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground uppercase tracking-wider">
                  Suspend Station Operations
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Provide reason for suspending this station
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Reason for Suspension
              </label>
              <textarea
                value={suspensionReasonInput}
                onChange={(e) => setSuspensionReasonInput(e.target.value)}
                placeholder="e.g. Policy violation, maintenance compliance, or customer safety investigation..."
                className="w-full h-32 bg-background text-foreground border border-border rounded-xl p-4 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-warning/20 focus:border-warning/80 transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSuspending(false)}
                className="flex-1 py-3 border border-border hover:bg-muted rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingAction}
                onClick={handleSuspend}
                className="flex-1 py-3 bg-warning hover:opacity-90 text-warning-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-warning/10"
              >
                Suspend Station
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign in to Book a Wash"
        message="You must be logged in to book a vehicle wash appointment and select live time slots."
        actionName="book a wash"
      />

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
