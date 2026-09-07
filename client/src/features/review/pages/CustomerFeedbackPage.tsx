import { useState, useEffect, useCallback } from "react"
import {
  Star,
  Search,
  MessageSquare,
  Building2,
  Calendar,
  X,
  Loader2,
  MessageCircle,
  Flag,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { reviewApi } from "@/shared/apis/review.api"
import type {
  FindProviderFeedbackParams,
  ProviderStationOption,
  ReviewDto,
} from "@/shared/types/review.types"
import { Pagination, type PaginationMeta } from "@/shared/components/ui/Pagination"

const REPORT_REASONS = [
  { id: "DEFAMATION", label: "Defamatory or false claim" },
  { id: "ABUSIVE_LANGUAGE", label: "Abusive, threatening, or offensive language" },
  { id: "SPAM_PROMOTION", label: "Spam or competitor advertisement" },
  { id: "FAKE_VISIT", label: "Customer did not visit this station" },
  { id: "OTHER", label: "Other violation" },
]

export default function CustomerFeedbackPage() {
  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [stations, setStations] = useState<ProviderStationOption[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Filters
  const [search, setSearch] = useState<string>("")
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL")
  const [stationFilter, setStationFilter] = useState<string>("ALL")
  const [pillFilter, setPillFilter] = useState<"ALL" | "LOW_RATED">("ALL")

  // Report Modal State
  const [reportTargetReview, setReportTargetReview] = useState<ReviewDto | null>(null)
  const [selectedReportReason, setSelectedReportReason] = useState<string>("DEFAMATION")
  const [customReportReason, setCustomReportReason] = useState<string>("")
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false)
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set())

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: FindProviderFeedbackParams = {
        page,
        limit,
        search: search.trim() || undefined,
        stationId: stationFilter !== "ALL" ? stationFilter : undefined,
        rating: ratingFilter !== "ALL" ? Number(ratingFilter) : undefined,
        pillFilter: pillFilter !== "ALL" ? pillFilter : undefined,
      }

      const res = await reviewApi.getProviderFeedback(params)
      setReviews(res.reviews || [])
      if (res.stations && res.stations.length > 0) {
        setStations(res.stations)
      }

      const total = res.total || 0
      const totalPages = res.totalPages || 1
      setPaginationMeta({
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      })
    } catch {
      toast.error("Failed to load customer feedback")
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, search, stationFilter, ratingFilter, pillFilter])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchReviews()
    })
    return () => {
      ignore = true
    }
  }, [fetchReviews])

  const handlePillChange = (tab: "ALL" | "LOW_RATED") => {
    setPillFilter(tab)
    setPage(1)
  }

  const handleOpenReportModal = (review: ReviewDto) => {
    setReportTargetReview(review)
    setSelectedReportReason("DEFAMATION")
    setCustomReportReason("")
  }

  const handleCloseReportModal = () => {
    setReportTargetReview(null)
    setIsSubmittingReport(false)
  }

  const handleSubmitReport = async () => {
    if (!reportTargetReview) return
    const reasonText =
      selectedReportReason === "OTHER"
        ? customReportReason.trim() || "OTHER"
        : REPORT_REASONS.find((r) => r.id === selectedReportReason)?.label || selectedReportReason

    setIsSubmittingReport(true)
    try {
      await reviewApi.reportReview(reportTargetReview.id, reasonText)
      toast.success("Review reported for administrator moderation review.")
      setReportedIds((prev) => new Set(prev).add(reportTargetReview.id))
      handleCloseReportModal()
    } catch {
      toast.error("Failed to submit review report")
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <MessageSquare className="w-7 h-7 text-primary" />
              Customer Feedback
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Monitor reviews, ratings, and customer experiences across your stations in real-time.
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mt-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer, station, ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 bg-card/80 border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Ratings dropdown */}
            <select
              value={ratingFilter}
              onChange={(e) => {
                const val = e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                setRatingFilter(val)
                setPage(1)
              }}
              className="bg-card/80 border border-border text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Stations dropdown */}
            <select
              value={stationFilter}
              onChange={(e) => {
                setStationFilter(e.target.value)
                setPage(1)
              }}
              className="bg-card/80 border border-border text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer max-w-[180px] truncate"
            >
              <option value="ALL">All Stations</option>
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pill Switcher */}
          <div className="flex items-center bg-card/80 border border-border p-1 rounded-xl self-start lg:self-auto">
            <button
              onClick={() => handlePillChange("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pillFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => handlePillChange("LOW_RATED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pillFilter === "LOW_RATED"
                  ? "bg-destructive text-destructive-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Low Rated
            </button>
          </div>
        </div>
      </div>

      {/* Main Review Cards Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card/60 border border-border/80 rounded-2xl">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading customer feedback...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card/60 border border-border/80 rounded-2xl text-center px-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              No customer reviews found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {search || ratingFilter !== "ALL" || stationFilter !== "ALL" || pillFilter !== "ALL"
                ? "No reviews match your current filter settings. Try clearing your filters."
                : "Your stations haven't received any customer reviews yet."}
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const isReported = reportedIds.has(review.id)
            const initials =
              (review.user?.name || "Customer")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "C"

            const bookingNum =
              review.booking?.bookingNumber ||
              (typeof review.bookingId === "string"
                ? review.bookingId.slice(0, 10)
                : (review.bookingId as { bookingNumber?: string })?.bookingNumber || "WQ-Booking")

            return (
              <div
                key={review.id}
                className="bg-card/70 border border-border/80 hover:border-border rounded-2xl p-5 transition-all shadow-xs backdrop-blur-sm"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* User info & Ratings */}
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    {review.user?.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name || "Customer"}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                        {initials}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">
                          {review.user?.name || "Customer"}
                        </h3>
                      </div>

                      {/* Stars & Meta */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {review.rating.toFixed(1)}
                        </span>

                        <span className="text-muted-foreground/50">•</span>

                        {/* Station Tag */}
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{review.station?.name || "Station"}</span>
                        </div>

                        {/* Booking Number */}
                        {bookingNum && (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="text-xs text-muted-foreground">
                              Booking #{bookingNum}
                            </span>
                          </>
                        )}

                        <span className="text-muted-foreground/50">•</span>

                        {/* Date */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Report */}
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => !isReported && handleOpenReportModal(review)}
                      disabled={isReported}
                      title={isReported ? "Already reported" : "Report review to admin"}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium transition-colors ${
                        isReported
                          ? "text-rose-500 bg-rose-500/10 opacity-60 cursor-not-allowed"
                          : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{isReported ? "Reported" : "Report"}</span>
                    </button>
                  </div>
                </div>

                {/* Review Body */}
                <div className="mt-3 text-xs text-foreground/90 leading-relaxed pl-0 sm:pl-13">
                  {review.comment ? (
                    <p className="whitespace-pre-line">{review.comment}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No written comment provided.</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {!isLoading && paginationMeta.totalPages > 1 && (
        <div className="mt-6 border-t border-border/80 pt-3">
          <Pagination meta={paginationMeta} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Report Modal */}
      {reportTargetReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={handleCloseReportModal}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Report Customer Review</h3>
                <p className="text-xs text-muted-foreground">
                  Flag this review for administrator moderation and inspection.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-foreground block">
                Reason for reporting:
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                      selectedReportReason === r.id
                        ? "bg-destructive/10 border-destructive text-foreground font-semibold"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="providerReportReason"
                      value={r.id}
                      checked={selectedReportReason === r.id}
                      onChange={(e) => setSelectedReportReason(e.target.value)}
                      className="text-destructive focus:ring-destructive"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>

              {selectedReportReason === "OTHER" && (
                <div className="pt-2">
                  <textarea
                    rows={3}
                    value={customReportReason}
                    onChange={(e) => setCustomReportReason(e.target.value)}
                    placeholder="Describe the reason for reporting this review..."
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-destructive transition-colors resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseReportModal}
                disabled={isSubmittingReport}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-destructive hover:opacity-90 disabled:opacity-50 text-destructive-foreground shadow-xs transition-colors"
              >
                {isSubmittingReport ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag size={13} />
                    Report Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
