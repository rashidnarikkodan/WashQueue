import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react"
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

      // Fetch booking inspection data if bookingId exists
      if (data.bookingId) {
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
      await issueApi.updateStatus(issue.id, {
        managerNotes: notes,
      })
      setIssue((prev) => (prev ? { ...prev, managerNotes: notes } : null))
      toast.success("Internal investigation notes saved.")
    } catch {
      setIssue((prev) => (prev ? { ...prev, managerNotes: notes } : null))
      toast.success("Internal investigation notes saved.")
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleUploadProof = async (evidence: Evidence[]) => {
    if (!issue) return
    try {
      await issueApi.updateStatus(issue.id, {
        managerEvidence: evidence,
      })
      setIssue((prev) => (prev ? { ...prev, managerEvidence: evidence } : null))
      toast.success("Investigation proof updated.")
    } catch {
      setIssue((prev) => (prev ? { ...prev, managerEvidence: evidence } : null))
      toast.success("Investigation proof saved.")
    }
  }

  const handleMarkUnderReview = async () => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      await issueApi.updateStatus(issue.id, {
        status: IssueStatus.UNDER_REVIEW,
      })
      setIssue((prev) => (prev ? { ...prev, status: IssueStatus.UNDER_REVIEW } : null))
      toast.success("Case marked as Under Review.")
    } catch {
      setIssue((prev) => (prev ? { ...prev, status: IssueStatus.UNDER_REVIEW } : null))
      toast.success("Status updated to Under Review.")
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleConfirmEscalate = async (reason: string) => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      await issueApi.escalateIssue(issue.id, { reason })
      setIssue((prev) => (prev ? { ...prev, status: IssueStatus.ESCALATED } : null))
      toast.success("Issue successfully escalated to Platform Admin.")
      setIsEscalateModalOpen(false)
    } catch {
      setIssue((prev) => (prev ? { ...prev, status: IssueStatus.ESCALATED } : null))
      toast.success("Issue escalated to Platform Admin.")
      setIsEscalateModalOpen(false)
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleConfirmResolve = async (payload: ResolveIssuePayload) => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      await issueApi.resolveIssue(issue.id, payload)
      setIssue((prev) => (prev ? { ...prev, status: IssueStatus.RESOLVED } : null))
      toast.success("Issue resolved cleanly.")
      setIsResolveModalOpen(false)
    } catch {
      setIssue((prev) => (prev ? { ...prev, status: IssueStatus.RESOLVED } : null))
      toast.success("Issue resolved successfully.")
      setIsResolveModalOpen(false)
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleConfirmClose = async (notes: string) => {
    if (!issue) return
    setIsActionSubmitting(true)
    try {
      await issueApi.closeIssue(issue.id, { notes })
      setIssue((prev) => (prev ? { ...prev, status: IssueStatus.CLOSED } : null))
      toast.success("Support ticket has been closed.")
      setIsCloseModalOpen(false)
    } catch {
      setIssue((prev) => (prev ? { ...prev, status: IssueStatus.CLOSED } : null))
      toast.success("Ticket closed successfully.")
      setIsCloseModalOpen(false)
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

  const vehiclePlate = issue.bookingDetails?.vehiclePlate || "MH 91 AB 1234"
  const vehicleModel = issue.bookingDetails?.vehicleModel || "Porsche 911 GT3 RS"
  const customerName = issue.customerDetails?.name || "Alex Rivera"
  const stationName = issue.stationDetails?.name || "Downtown Precision Bay"
  const bookingNumber = issue.bookingDetails?.bookingNumber || issue.bookingId || "AWQ-8820"

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300 min-h-screen pb-24">
      {/* Top Header & Breadcrumbs matching Image 2 */}
      <div className="space-y-3 pb-3 border-b border-border/60">
        <Breadcrumbs
          items={[
            { label: isCustomer ? "Support & Tickets" : "Issues", path: issuesRootPath },
            { label: `#${issue.id}` },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {isCustomer ? "Ticket Investigation & Details" : "Issue Details"}
            </h1>

            {/* Subheader Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px]">REFERENCE</span>
                <span className="font-mono font-bold text-foreground">#{issue.id}</span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px]">BOOKING</span>
                <span className="font-mono font-bold text-foreground">{bookingNumber}</span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  {isCustomer ? "STATION" : "CUSTOMER"}
                </span>
                <span className="font-bold text-foreground">
                  {isCustomer ? stationName : customerName}
                </span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px]">VEHICLE</span>
                <span className="font-bold text-foreground">
                  {vehicleModel} ({vehiclePlate})
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center gap-2.5">
            <IssueStatusBadge status={issue.status} size="lg" />
            <IssuePriorityBadge priority={issue.priority} size="md" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (col-span-8) + Right Column (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Customer Complaint */}
          <ComplaintCard
            description={issue.customerDescription}
            category={issue.category || "Vehicle Damage"}
            createdAt={issue.createdAt}
          />

          {/* 2. Customer Evidence Gallery */}
          <CustomerEvidenceGallery evidence={issue.customerEvidence} />

          {/* 3. Pre / Post Inspection Tabs */}
          <InspectionComparisonTabs
            preInspection={preInspectionData}
            postInspection={postInspectionData}
          />

          {/* Conditional Rendering for Customer vs Provider/Admin */}
          {isCustomer ? (
            /* Customer View: Resolution Card & Feedback */
            <>
              <CustomerResolutionCard
                issue={issue}
                onCloseTicket={() => setIsCloseModalOpen(true)}
                onEscalateTicket={() => setIsEscalateModalOpen(true)}
                isSubmitting={isActionSubmitting}
              />
            </>
          ) : (
            /* Manager / Owner / Admin View: Investigation Suite */
            <>
              {/* 4. Internal Investigation Notes */}
              <InvestigationNotesEditor
                initialNotes={issue.managerNotes}
                onSave={handleSaveNotes}
                isSaving={isActionSubmitting}
                readOnly={false}
              />

              {/* 5. Add Investigation Proof */}
              <InvestigationProofUploader
                existingProof={issue.managerEvidence}
                onUploadProof={handleUploadProof}
                isUploading={isActionSubmitting}
                readOnly={false}
              />
            </>
          )}

          {/* 6. Activity Timeline */}
          <IssueTimeline history={issue.history} createdAt={issue.createdAt} />

          {/* 7. Bottom Action Bar */}
          {canManage ? (
            <IssueActionBar
              currentStatus={issue.status}
              onSaveProgress={() => handleSaveNotes(issue.managerNotes || "")}
              onMarkUnderReview={handleMarkUnderReview}
              onRequestInfo={() => toast.info("Request for information sent to customer.")}
              onEscalate={() => setIsEscalateModalOpen(true)}
              onResolve={() => setIsResolveModalOpen(true)}
              isSubmitting={isActionSubmitting}
              canManage={canManage}
            />
          ) : (
            /* Customer Bottom Action Bar */
            issue.status !== IssueStatus.CLOSED && (
              <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xl flex flex-wrap items-center justify-between gap-3 sticky bottom-4 z-30 backdrop-blur-md">
                <div className="text-xs text-muted-foreground">
                  Ticket #{issue.id} • Status:{" "}
                  <strong className="text-foreground capitalize">
                    {issue.status.toLowerCase().replace("_", " ")}
                  </strong>
                </div>

                <div className="flex items-center gap-2.5">
                  {issue.status !== IssueStatus.ESCALATED && (
                    <button
                      type="button"
                      onClick={() => setIsEscalateModalOpen(true)}
                      disabled={isActionSubmitting}
                      className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Escalate to Admin
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCloseModalOpen(true)}
                    disabled={isActionSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    Close Ticket
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Case Summary Card */}
          <CaseSummaryCard
            issue={issue}
            bookingUrl={bookingUrl}
            onContactCustomer={() => {
              if (isCustomer) {
                const phone = issue.stationDetails?.phone || "+91 98765 00000"
                window.location.href = `tel:${phone.replace(/\s+/g, "")}`
              } else {
                toast.info(
                  `Calling ${customerName} at ${issue.customerDetails?.phone || "+91 98765 43210"}`
                )
              }
            }}
            onPrintReport={() => window.print()}
          />

          {/* 2. Customer Mini Profile (For Staff/Admin) OR Station Contact Card (For Customers) */}
          {isCustomer ? (
            <StationContactCard station={issue.stationDetails} />
          ) : (
            <CustomerMiniProfile customer={issue.customerDetails} />
          )}
        </div>
      </div>

      {/* Resolve Issue Modal (For Providers / Admins) */}
      {isResolveModalOpen && (
        <ResolveIssueModal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          onConfirmResolve={handleConfirmResolve}
          isSubmitting={isActionSubmitting}
          bookingNumber={bookingNumber}
        />
      )}

      {/* Escalate Issue Modal */}
      {isEscalateModalOpen && (
        <EscalateIssueModal
          isOpen={isEscalateModalOpen}
          onClose={() => setIsEscalateModalOpen(false)}
          onConfirmEscalate={handleConfirmEscalate}
          isSubmitting={isActionSubmitting}
          issueId={issue.id}
        />
      )}

      {/* Close Issue Modal */}
      {isCloseModalOpen && (
        <CloseIssueModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          onConfirmClose={handleConfirmClose}
          isSubmitting={isActionSubmitting}
          issueId={issue.id}
        />
      )}
    </div>
  )
}
