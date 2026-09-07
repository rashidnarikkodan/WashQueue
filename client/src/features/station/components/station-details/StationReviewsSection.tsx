import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowUpDown,
  Sparkles,
  Flag,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { reviewApi } from "@/shared/apis/review.api"
import type { ReviewDto } from "@/shared/types/review.types"

interface StationReviewsSectionProps {
  stationId?: string
  rating?: number
  reviewCount?: number
}

type SortOption = "LATEST" | "HIGHEST" | "LOWEST"

const REPORT_REASONS = [
  { id: "INAPPROPRIATE_CONTENT", label: "Inappropriate or offensive language" },
  { id: "SPAM", label: "Spam, advertisement, or promotion" },
  { id: "FAKE_REVIEW", label: "Fake review / Did not experience service" },
  { id: "HARASSMENT", label: "Harassment or hate speech" },
  { id: "OTHER", label: "Other issue" },
]

export function StationReviewsSection({
  stationId,
  rating: initialRating = 0,
  reviewCount: initialReviewCount = 0,
}: StationReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [fetchedRating, setFetchedRating] = useState<number | null>(null)
  const [fetchedReviewCount, setFetchedReviewCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(stationId))
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [sortBy, setSortBy] = useState<SortOption>("LATEST")
  const limit = 5

  // Report review modal state
  const [reportingReview, setReportingReview] = useState<ReviewDto | null>(null)
  const [selectedReason, setSelectedReason] = useState<string>("INAPPROPRIATE_CONTENT")
  const [customReason, setCustomReason] = useState<string>("")
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false)
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set())

  const fetchReviews = useCallback(
    async (page: number, sort: SortOption) => {
      if (!stationId) return
      setIsLoading(true)
      try {
        const res = await reviewApi.getStationReviews(stationId, page, limit, sort)
        if (res) {
          setReviews(res.reviews || [])
          setTotalPages(Math.max(1, res.totalPages || Math.ceil((res.total || 0) / limit)))
          setCurrentPage(res.page || page)
          if (res.reviewCount > 0) {
            setFetchedRating(res.averageRating)
            setFetchedReviewCount(res.reviewCount)
          }
        }
      } catch (err) {
        console.error("Failed to load station reviews:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [stationId, limit]
  )

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchReviews(currentPage, sortBy)
    })

    return () => {
      ignore = true
    }
  }, [fetchReviews, currentPage, sortBy])

  const rating = fetchedRating !== null ? fetchedRating : initialRating
  const reviewCount = fetchedReviewCount !== null ? fetchedReviewCount : initialReviewCount

  const breakdown = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)))
      counts[rounded] = (counts[rounded] || 0) + 1
    })

    const totalSample = reviews.length > 0 ? reviews.length : 1
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = counts[stars] || 0
      const percentage = reviews.length > 0 ? Math.round((count / totalSample) * 100) : 0
      return { stars, count, percentage }
    })
  }, [reviews])

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handleOpenReportModal = (review: ReviewDto) => {
    setReportingReview(review)
    setSelectedReason("INAPPROPRIATE_CONTENT")
    setCustomReason("")
  }

  const handleCloseReportModal = () => {
    setReportingReview(null)
    setIsSubmittingReport(false)
  }

  const handleSubmitReport = async () => {
    if (!reportingReview) return
    const reasonText =
      selectedReason === "OTHER"
        ? customReason.trim() || "OTHER"
        : REPORT_REASONS.find((r) => r.id === selectedReason)?.label || selectedReason

    setIsSubmittingReport(true)
    try {
      await reviewApi.reportReview(reportingReview.id, reasonText)
      toast.success("Review reported. Our moderation team will investigate.")
      setReportedIds((prev) => new Set(prev).add(reportingReview.id))
      handleCloseReportModal()
    } catch {
      toast.error("Failed to submit report. Please check if you are signed in.")
    } finally {
      setIsSubmittingReport(false)
    }
  }

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Star className="w-5 h-5 fill-primary/30 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Reviews &amp; Ratings
            </h2>
            <p className="text-xs text-muted-foreground">
              See what customers are saying about this station. Real reviews, real experiences.
            </p>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-2 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
            <span className="text-5xl sm:text-6xl font-black text-foreground tracking-tight">
              {rating ? rating.toFixed(1) : "0.0"}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30 fill-transparent"
                  }
                />
              ))}
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Average Rating</span>
              <span className="text-[11px] text-muted-foreground">
                Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          <div className="md:col-span-8 space-y-3 px-8">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-foreground">Rating Breakdown</h3>
              <span className="text-xs text-muted-foreground font-medium">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>

            <div className="space-y-2.5">
              {breakdown.map(({ stars, percentage }) => (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-8 shrink-0 font-bold text-foreground">
                    <span>{stars}</span>
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </div>

                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-10 text-right font-mono text-[11px] text-muted-foreground shrink-0">
                    {percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Customer Reviews</h3>
            {reviewCount > 0 && (
              <span className="text-xs text-muted-foreground font-semibold">({reviewCount})</span>
            )}
          </div>

          {reviewCount > 1 && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                aria-label="Sort customer reviews"
                className="bg-card border border-border text-foreground text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
              >
                <option value="LATEST">Latest First</option>
                <option value="HIGHEST">Highest Rating</option>
                <option value="LOWEST">Lowest Rating</option>
              </select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center space-y-2 rounded-2xl border border-dashed border-border/70 bg-card/40">
            <Sparkles className="w-6 h-6 text-muted-foreground/50 mx-auto" />
            <p className="text-xs font-semibold text-foreground">No reviews yet</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Be the first to share your experience with this station after your wash!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {reviews.map((rev) => {
              const userName = rev.user?.name || "Verified Customer"
              const userAvatar = rev.user?.avatar
              const dateFormatted = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Recent"
              const isReported = reportedIds.has(rev.id)

              return (
                <div key={rev.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-9 h-9 rounded-full object-cover border border-primary/20 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-xs font-bold text-foreground">{userName}</span>
                        <span className="text-[11px] text-muted-foreground">{dateFormatted}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 text-[10px] font-bold">
                          <ShieldCheck size={10} /> Verified Booking
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={
                              i < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/25 fill-transparent"
                            }
                          />
                        ))}
                      </div>

                      {/* Report button */}
                      <button
                        type="button"
                        onClick={() => !isReported && handleOpenReportModal(rev)}
                        disabled={isReported}
                        title={isReported ? "Already reported" : "Report this review"}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isReported
                            ? "text-rose-500 opacity-60 cursor-not-allowed"
                            : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        }`}
                      >
                        <Flag
                          size={13}
                          className={isReported ? "fill-rose-500 text-rose-500" : ""}
                        />
                      </button>
                    </div>
                  </div>

                  {rev.comment ? (
                    <p className="text-xs text-foreground/90 leading-relaxed pl-12 pr-2">
                      "{rev.comment}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/70 italic pl-12">
                      Customer left a {rev.rating}-star rating.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <span className="text-xs text-muted-foreground">
              Page <strong className="text-foreground">{currentPage}</strong> of{" "}
              <strong className="text-foreground">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={isLoading}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Review Modal */}
      {reportingReview && (
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
                <h3 className="text-base font-bold text-foreground">Report Review</h3>
                <p className="text-xs text-muted-foreground">
                  Help us understand why this review should be moderated.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-foreground block">
                Select a reason for reporting:
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                      selectedReason === r.id
                        ? "bg-destructive/10 border-destructive text-foreground font-semibold"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={selectedReason === r.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-destructive focus:ring-destructive"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>

              {selectedReason === "OTHER" && (
                <div className="pt-2">
                  <textarea
                    rows={3}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please explain why you're reporting this review..."
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
                    Submit Report
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
