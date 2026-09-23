import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, RefreshCw, AlertTriangle, LifeBuoy } from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import Loading from "@/shared/components/ui/Loading"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { issueApi } from "@/shared/apis/issue.api"
import { bookingApi } from "@/shared/apis/booking.api"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { getErrorMessage } from "@/shared/utils/error"
import type { IssueDto, Evidence, ResolveIssuePayload } from "../types/issue.types"
import { IssueStatus } from "../types/issue.types"
import {
  IssueStatusBadge,
  IssuePriorityBadge,
  ComplaintCard,
  CustomerEvidenceGallery,
  InspectionComparisonTabs,
  InvestigationNotesEditor,
  InvestigationProofUploader,
  IssueTimeline,
  IssueActionBar,
  CaseSummaryCard,
  CustomerMiniProfile,
  StationContactCard,
  CustomerResolutionCard,
  ResolveIssueModal,
  EscalateIssueModal,
  CloseIssueModal,
  AssignManagerModal,
} from "../components"
import type { InspectionData } from "../components/InspectionComparisonTabs"

interface IssueDetailsPageProps {
  role?: RoleType | string
}

export default function IssueDetailsPage({ role: explicitRole }: IssueDetailsPageProps = {}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  const [issue, setIssue] = useState<IssueDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActionSubmitting, setIsActionSubmitting] = useState(false)

  // Modals state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  // Pre & post inspection snapshot
  const [preInspectionData, setPreInspectionData] = useState<InspectionData | null>(null)
  const [postInspectionData, setPostInspectionData] = useState<InspectionData | null>(null)

  const currentRole: RoleType = useMemo(() => {
    if (explicitRole) return explicitRole as RoleType
    if (user?.role === ROLE.ADMIN || location.pathname.startsWith("/admin")) return ROLE.ADMIN
    if (user?.role === ROLE.OWNER || location.pathname.startsWith("/owner")) return ROLE.OWNER
    if (user?.role === ROLE.MANAGER || location.pathname.startsWith("/manager")) return ROLE.MANAGER
    return ROLE.CUSTOMER
  }, [explicitRole, user?.role, location.pathname])

  const isAdmin = currentRole === ROLE.ADMIN
  const isManager = currentRole === ROLE.MANAGER
  const isOwner = currentRole === ROLE.OWNER
  const isCustomer = currentRole === ROLE.CUSTOMER
  const canManage = isAdmin || isManager || isOwner

  const fetchIssue = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await issueApi.getById(id)
      setIssue(data)

      // Use populated inspections if already present on issue
      if (data.bookingDetails?.preServiceInspection) {
        setPreInspectionData(data.bookingDetails.preServiceInspection)
      }
      if (data.bookingDetails?.postServiceInspection) {
        setPostInspectionData(data.bookingDetails.postServiceInspection)
      }

      // If not populated, fetch booking inspection data directly
      if (
        data.bookingId &&
        (!data.bookingDetails?.preServiceInspection || !data.bookingDetails?.postServiceInspection)
      ) {
        try {
          const booking = await bookingApi.getBookingById(data.bookingId)
          if (booking) {
            setPreInspectionData(booking.preServiceInspection ?? null)
            setPostInspectionData(booking.postServiceInspection ?? null)
          }
        } catch {
          // Silent fallback
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load issue details from server"))
      setIssue(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchIssue()
    })
    return () => {
      ignore = true
    }
  }, [fetchIssue])

  const handleSaveNotes = async (notes: string) => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      const updated = await issueApi.updateStatus(issue.id, {
        managerNotes: notes,
      })
      setIssue(updated)
      toast.success("Internal investigation notes saved.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save investigation notes"))
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleUploadProof = async (evidence: Evidence[]) => {
    if (!issue) return
    try {
      const updated = await issueApi.updateStatus(issue.id, {
        managerEvidence: evidence,
      })
      setIssue(updated)
      toast.success("Investigation proof updated.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update investigation proof"))
    }
  }

  const handleMarkUnderReview = async () => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      const updated = await issueApi.updateStatus(issue.id, {
        status: IssueStatus.UNDER_REVIEW,
      })
      setIssue(updated)
      toast.success("Case marked as Under Review.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to mark issue as Under Review"))
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleConfirmAssign = async (managerId: string) => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      const updated = await issueApi.assignManager(issue.id, { managerId })
      setIssue(updated)
      toast.success("Manager assigned to issue successfully.")
      setIsAssignModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to assign manager"))
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleConfirmEscalate = async (reason: string) => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      const updated = await issueApi.escalateIssue(issue.id, { reason })
      setIssue(updated)
      toast.success("Issue successfully escalated to Platform Admin.")
      setIsEscalateModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to escalate issue"))
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleConfirmResolve = async (payload: ResolveIssuePayload) => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      const updated = await issueApi.resolveIssue(issue.id, payload)
      setIssue(updated)
      toast.success("Issue resolved cleanly.")
      setIsResolveModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to resolve issue"))
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleConfirmClose = async (notes: string) => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      const updated = await issueApi.closeIssue(issue.id, { notes })
      setIssue(updated)
      toast.success("Support ticket has been closed.")
      setIsCloseModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to close issue"))
    } finally {
      setIsActionSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-foreground">
        <Loading size="lg" text="Retrieving issue details..." />
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 pt-16 pb-20 text-left space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Issues</span>
        </button>

        <div className="p-8 rounded-3xl bg-card border border-red-500/20 text-center space-y-4 shadow-xl">
          <AlertTriangle size={48} className="text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Unable to Load Issue</h2>
          <p className="text-xs text-muted-foreground">{error || "Issue case not found."}</p>
          <button
            type="button"
            onClick={() => fetchIssue()}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  const issuesRootPath = isAdmin
    ? `${APP_ROUTES.ADMIN.ROOT}/issues`
    : isOwner
      ? `${APP_ROUTES.OWNER.ROOT}/issues`
      : isManager
        ? `${APP_ROUTES.MANAGER.ROOT}/issues`
        : "/issues"

  const bookingUrl = isAdmin
    ? `${APP_ROUTES.ADMIN.ROOT}/bookings/${issue.bookingId}`
    : isOwner
      ? `${APP_ROUTES.OWNER.ROOT}/bookings/${issue.bookingId}`
      : isManager
        ? `${APP_ROUTES.MANAGER.ROOT}/bookings/${issue.bookingId}`
        : `/bookings/${issue.bookingId}`

  const stationName = issue.stationDetails?.name || "WashQueue Station"
  const bookingNumber = issue.bookingDetails?.bookingNumber || issue.bookingId

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300 min-h-screen pb-24">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 pb-3 border-b border-border/60">
        <Breadcrumbs
          items={[
            { label: isCustomer ? "Support & Tickets" : "Issues", path: issuesRootPath },
            { label: `#${issue.id}` },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <LifeBuoy className="w-8 h-8 text-primary" />
              <span>
                {isCustomer ? "Ticket Investigation & Details" : "Issue Investigation Hub"}
              </span>
            </h1>

            {/* Subheader Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px]">CASE REF</span>
                <span className="font-mono font-bold text-foreground">#{issue.id}</span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px]">BOOKING</span>
                <span className="font-mono font-bold text-foreground">#{bookingNumber}</span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px]">STATION</span>
                <span className="font-semibold text-foreground">{stationName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <IssuePriorityBadge priority={issue.priority} />
            <IssueStatusBadge status={issue.status} />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Official Resolution Summary if resolved/closed */}
          <CustomerResolutionCard
            issue={issue}
            onCloseTicket={() => setIsCloseModalOpen(true)}
            onEscalateTicket={() => setIsEscalateModalOpen(true)}
            isSubmitting={isActionSubmitting}
          />

          {/* Customer Complaint Statement */}
          <ComplaintCard
            description={issue.customerDescription}
            category={issue.category || "Vehicle Damage"}
            createdAt={issue.createdAt}
          />

          {/* Customer Uploaded Evidence Photos */}
          {issue.customerEvidence && issue.customerEvidence.length > 0 && (
            <CustomerEvidenceGallery evidence={issue.customerEvidence} />
          )}

          {/* High-Resolution Pre & Post Optical Inspection Verification */}
          <InspectionComparisonTabs
            preInspection={preInspectionData}
            postInspection={postInspectionData}
          />

          {/* Management Investigation & Notes (Visible to Manager / Owner / Admin) */}
          {canManage && (
            <div className="space-y-6">
              <InvestigationNotesEditor
                initialNotes={issue.managerNotes}
                onSave={handleSaveNotes}
                isSaving={isActionSubmitting}
                readOnly={issue.status === IssueStatus.CLOSED}
              />

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                  OFFICIAL INVESTIGATION PROOF FILES
                </span>
                <InvestigationProofUploader
                  existingProof={issue.managerEvidence}
                  onUploadProof={handleUploadProof}
                  readOnly={issue.status === IssueStatus.CLOSED}
                />
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xl">
            <IssueTimeline history={issue.history} createdAt={issue.createdAt} />
          </div>

          {/* Action Bar */}
          <IssueActionBar
            currentStatus={issue.status}
            onSaveProgress={() => handleSaveNotes(issue.managerNotes || "")}
            onMarkUnderReview={handleMarkUnderReview}
            onAssignManager={canManage ? () => setIsAssignModalOpen(true) : undefined}
            onEscalate={() => setIsEscalateModalOpen(true)}
            onResolve={() => setIsResolveModalOpen(true)}
            onCloseTicket={() => setIsCloseModalOpen(true)}
            isSubmitting={isActionSubmitting}
            canManage={canManage}
            isCustomer={isCustomer}
            role={currentRole}
          />
        </div>

        {/* Right Sidebar Meta & Info */}
        <div className="lg:col-span-4 space-y-6">
          <CaseSummaryCard
            issue={issue}
            bookingUrl={bookingUrl}
            onContactCustomer={() => {
              if (issue.customerDetails?.phone) {
                window.location.href = `tel:${issue.customerDetails.phone.replace(/\s+/g, "")}`
              } else {
                toast.info(`Customer email: ${issue.customerDetails?.email || "N/A"}`)
              }
            }}
          />

          {!isCustomer && <CustomerMiniProfile customer={issue.customerDetails} />}

          <StationContactCard station={issue.stationDetails} />
        </div>
      </div>

      {/* Modals */}
      {isResolveModalOpen && (
        <ResolveIssueModal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          onConfirmResolve={handleConfirmResolve}
          isSubmitting={isActionSubmitting}
          bookingNumber={bookingNumber}
        />
      )}

      {isEscalateModalOpen && (
        <EscalateIssueModal
          isOpen={isEscalateModalOpen}
          onClose={() => setIsEscalateModalOpen(false)}
          onConfirmEscalate={handleConfirmEscalate}
          isSubmitting={isActionSubmitting}
          issueId={issue.id}
          role={currentRole}
        />
      )}

      {isCloseModalOpen && (
        <CloseIssueModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          onConfirmClose={handleConfirmClose}
          isSubmitting={isActionSubmitting}
          issueId={issue.id}
        />
      )}

      {isAssignModalOpen && (
        <AssignManagerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onConfirmAssign={handleConfirmAssign}
          isSubmitting={isActionSubmitting}
          currentManagerId={issue.assignedManagerId}
          stationId={issue.stationId}
        />
      )}
    </div>
  )
}
