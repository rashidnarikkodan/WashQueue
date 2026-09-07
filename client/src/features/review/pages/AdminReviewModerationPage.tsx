import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Star,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  Building2,
  X,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  MessageSquareQuote,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import {
  DataTable,
  DataTableToolbar,
  type Column,
  type TabConfig,
  type SelectFilter,
  type PaginationMeta,
} from "@/shared/components/data-table"
import { reviewApi } from "@/shared/apis/review.api"
import type {
  AdminReviewMetrics,
  FindAdminReviewsParams,
  ReviewDto,
} from "@/shared/types/review.types"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"

const REVIEW_TABS: TabConfig[] = [
  { id: "ALL", label: "All Reviews" },
  { id: "FLAGGED", label: "Flagged for Moderation", activeColor: "border-rose-500 text-rose-500" },
  { id: "LOW_RATED", label: "Low Rated (≤2★)", activeColor: "border-amber-500 text-amber-500" },
]

export default function AdminReviewModerationPage() {
  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [metrics, setMetrics] = useState<AdminReviewMetrics | null>(null)
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

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [ratingFilter, setRatingFilter] = useState<string>("ALL")
  const [tabFilter, setTabFilter] = useState<string>("ALL")
  const [sortBy, setSortBy] = useState<string>("lowest")
  const [stationTab, setStationTab] = useState<"top" | "low">("top")

  // Modals & Actions
  const [selectedReview, setSelectedReview] = useState<ReviewDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ReviewDto | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [dismissTarget, setDismissTarget] = useState<ReviewDto | null>(null)
  const [isDismissing, setIsDismissing] = useState<boolean>(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: FindAdminReviewsParams = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        rating:
          tabFilter === "LOW_RATED"
            ? undefined
            : ratingFilter !== "ALL"
              ? Number(ratingFilter)
              : undefined,
        flaggedOnly: tabFilter === "FLAGGED" ? true : undefined,
        sortBy: tabFilter === "LOW_RATED" ? "lowest" : sortBy,
      }

      const res = await reviewApi.getAdminModeration(params)
      setReviews(res.reviews || [])
      setMetrics(res.metrics || null)

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
      toast.error("Failed to load review moderation data")
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, searchQuery, ratingFilter, tabFilter, sortBy])

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleTabChange = (tabId: string) => {
    setTabFilter(tabId)
    setPage(1)
  }

  const handleToggleVisibility = useCallback(async (review: ReviewDto) => {
    setActionLoadingId(review.id)
    const targetState = review.isVisible === false
    try {
      await reviewApi.toggleVisibility(review.id, targetState)
      toast.success(`Review ${targetState ? "made visible" : "hidden"}`)
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, isVisible: targetState } : r))
      )
      setSelectedReview((prev) =>
        prev && prev.id === review.id ? { ...prev, isVisible: targetState } : prev
      )
    } catch {
      toast.error("Failed to update review visibility")
    } finally {
      setActionLoadingId(null)
    }
  }, [])

  const handleDismissReports = async () => {
    if (!dismissTarget) return
    setIsDismissing(true)
    try {
      await reviewApi.dismissReports(dismissTarget.id)
      toast.success("Flagged reports dismissed successfully")
      setReviews((prev) =>
        prev.map((r) => (r.id === dismissTarget.id ? { ...r, reportCount: 0, flags: [] } : r))
      )
      if (selectedReview?.id === dismissTarget.id) {
        setSelectedReview((prev) => (prev ? { ...prev, reportCount: 0, flags: [] } : null))
      }
      setDismissTarget(null)
    } catch {
      toast.error("Failed to dismiss reports")
    } finally {
      setIsDismissing(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await reviewApi.deleteReview(deleteTarget.id)
      toast.success("Review deleted successfully")
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
      if (selectedReview?.id === deleteTarget.id) {
        setSelectedReview(null)
      }
    } catch {
      toast.error("Failed to delete review")
    } finally {
      setIsDeleting(false)
    }
  }

  // Stat HUD cards
  const statItems: StatItem[] = useMemo(() => {
    return [
      {
        id: "avg-rating",
        label: "Avg Platform Rating",
        value: `${(metrics?.averageRating || 0).toFixed(1)} ★`,
        variant: "amber",
        icon: Star,
        description: `${(metrics?.ratingChange || 0) >= 0 ? "+" : ""}${(
          metrics?.ratingChange || 0
        ).toFixed(1)} vs last month`,
      },
      {
        id: "total-reviews",
        label: "Total Reviews",
        value: (metrics?.totalReviews || 0).toLocaleString(),
        variant: "primary",
        icon: MessageSquareQuote,
        description: `+${metrics?.newThisMonth || 0} this month`,
      },
      {
        id: "low-ratings",
        label: "Low Ratings (≤2★)",
        value: metrics?.lowRatingCount || 0,
        variant: "rose",
        icon: AlertTriangle,
        description: "Requires operational inspection",
      },
      {
        id: "flagged-reviews",
        label: "Flagged Reviews",
        value: metrics?.flaggedCount || 0,
        variant: "red",
        icon: ShieldAlert,
        description: "Reported for inappropriate content",
      },
    ]
  }, [metrics])

  // Select Filters for Toolbar
  const selectFilters: SelectFilter[] = useMemo(() => {
    return [
      {
        id: "ratingFilter",
        label: "Rating Filter",
        value: ratingFilter,
        onChange: (val) => {
          setRatingFilter(val)
          setPage(1)
        },
        options: [
          { label: "All Ratings", value: "ALL" },
          { label: "5 Stars", value: "5" },
          { label: "4 Stars", value: "4" },
          { label: "3 Stars", value: "3" },
          { label: "2 Stars", value: "2" },
          { label: "1 Star", value: "1" },
        ],
      },
      {
        id: "sortBy",
        label: "Sort By",
        value: sortBy,
        onChange: (val) => {
          setSortBy(val)
          setPage(1)
        },
        options: [
          { label: "Lowest Rating First", value: "lowest" },
          { label: "Highest Rating First", value: "highest" },
          { label: "Most Recent", value: "recent" },
          { label: "Most Flagged", value: "most_flagged" },
        ],
      },
    ]
  }, [ratingFilter, sortBy])

  // DataTable columns
  const columns: Column<ReviewDto>[] = useMemo(() => {
    return [
      {
        id: "user",
        header: "Author / Customer",
        cell: (r) => (
          <div className="flex items-center gap-2.5 py-1">
            {r.user?.avatar ? (
              <img
                src={r.user.avatar}
                alt={r.user.name || "User"}
                className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                {(r.user?.name || "U").substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-xs truncate max-w-[150px]">
                {r.user?.name || "Anonymous"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                {r.user?.email || "No email"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "station",
        header: "Station",
        cell: (r) => (
          <div className="py-1">
            <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[160px]">{r.station?.name || "Station"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground pl-5 truncate max-w-[160px]">
              {r.station?.city || r.station?.state || "Location"}
            </p>
          </div>
        ),
      },
      {
        id: "rating",
        header: "Rating",
        cell: (r) => (
          <div className="flex items-center gap-1 py-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground ml-1">{r.rating.toFixed(1)}</span>
          </div>
        ),
      },
      {
        id: "comment",
        header: "Comment & Flags",
        cell: (r) => (
          <div className="py-1 max-w-[280px]">
            <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed">
              {r.comment || <span className="italic text-muted-foreground">No comment</span>}
            </p>
            {((r.reportCount && r.reportCount > 0) || (r.flags && r.flags.length > 0)) && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                  <ShieldAlert className="w-3 h-3" />
                  {r.reportCount || r.flags?.length} Report{r.reportCount === 1 ? "" : "s"}
                </span>
                {r.flags?.map((f, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-muted text-muted-foreground border border-border"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Visibility",
        cell: (r) => (
          <div className="py-1">
            {r.isVisible !== false ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Eye className="w-3 h-3" />
                Public
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <EyeOff className="w-3 h-3" />
                Hidden
              </span>
            )}
          </div>
        ),
      },
      {
        id: "createdAt",
        header: "Date",
        cell: (r) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap py-1">
            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (r) => {
          const isActing = actionLoadingId === r.id
          return (
            <div className="flex items-center gap-1.5 py-1">
              <button
                onClick={() => setSelectedReview(r)}
                title="View Full Details"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToggleVisibility(r)}
                disabled={isActing}
                title={r.isVisible !== false ? "Hide Review" : "Show Review"}
                className={`p-1.5 rounded-lg transition-colors ${
                  r.isVisible !== false
                    ? "text-amber-500 hover:bg-amber-500/10"
                    : "text-emerald-500 hover:bg-emerald-500/10"
                }`}
              >
                {isActing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : r.isVisible !== false ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

              {r.reportCount && r.reportCount > 0 ? (
                <button
                  onClick={() => setDismissTarget(r)}
                  title="Dismiss Flag Reports"
                  className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              ) : null}

              <button
                onClick={() => setDeleteTarget(r)}
                title="Delete Review"
                className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        },
      },
    ]
  }, [actionLoadingId, handleToggleVisibility])

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Title */}
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", path: APP_ROUTES.ADMIN.DASHBOARD },
            { label: "Review Moderation" },
          ]}
        />
        <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <MessageSquareQuote className="w-7 h-7 text-primary" />
              Reviews & Ratings Moderation
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Audit customer feedback, handle inappropriate reviews, and monitor station ratings
              across the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Top Metrics HUD */}
      <StatsHUD stats={statItems} columns={4} />

      {/* Rating Breakdown & Station Performance Widgets */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Rating Breakdown */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Rating Distribution
              </h3>
              <span className="text-xs text-muted-foreground">
                {metrics.totalReviews.toLocaleString()} ratings
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {(metrics.ratingBreakdown || []).map((rb) => (
                <div key={rb.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-medium text-muted-foreground flex items-center gap-1">
                    {rb.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rb.stars >= 4
                          ? "bg-amber-400"
                          : rb.stars === 3
                            ? "bg-blue-400"
                            : "bg-rose-500"
                      }`}
                      style={{ width: `${rb.percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-semibold text-foreground">
                    {rb.percentage}%
                  </span>
                  <span className="w-12 text-right text-muted-foreground">({rb.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Station Performance Leaderboard */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Station Quality Rank
              </h3>
              <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border">
                <button
                  onClick={() => setStationTab("top")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    stationTab === "top"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Top Rated
                </button>
                <button
                  onClick={() => setStationTab("low")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    stationTab === "low"
                      ? "bg-destructive text-destructive-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Low Rated
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {((stationTab === "top" ? metrics.topRatedStations : metrics.lowRatedStations) || [])
                .length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  No stations in this category.
                </p>
              ) : (
                (stationTab === "top" ? metrics.topRatedStations : metrics.lowRatedStations)
                  .slice(0, 3)
                  .map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{st.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{st.location}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {st.rating.toFixed(1)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            st.performanceTag === "PEAK"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : st.performanceTag === "STABLE"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          }`}
                        >
                          {st.performanceTag}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standard DataTable Toolbar & Table */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setPage(1)
        }}
        searchLabel="Search Reviews"
        searchPlaceholder="Search review comment, author, or station..."
        tabs={REVIEW_TABS}
        activeTab={tabFilter}
        onTabChange={handleTabChange}
        selectFilters={selectFilters}
      />

      <DataTable<ReviewDto>
        columns={columns}
        data={reviews}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        loadingText="Fetching reviews moderation ledger..."
        emptyMessage="No reviews found matching current filter criteria."
        pagination={paginationMeta}
        onPageChange={handlePageChange}
      />

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-xl rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Review Details</h3>
                <p className="text-xs text-muted-foreground">
                  Booking #
                  {selectedReview.booking?.bookingNumber ||
                    (typeof selectedReview.bookingId === "string"
                      ? selectedReview.bookingId.slice(0, 10)
                      : (selectedReview.bookingId as { bookingNumber?: string })?.bookingNumber ||
                        "WQ-Booking")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border text-xs">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {selectedReview.user?.name || "Anonymous"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Station:</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {selectedReview.station?.name || "Station"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Rating:</span>
                <p className="font-semibold text-amber-500 mt-0.5 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedReview.rating} / 5
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {selectedReview.isVisible !== false ? "Public" : "Hidden from Public"}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground">Review Comment</span>
              <p className="mt-1 p-3 rounded-xl bg-muted/30 border border-border text-xs text-foreground leading-relaxed whitespace-pre-line">
                {selectedReview.comment || (
                  <span className="italic text-muted-foreground">No comment</span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleVisibility(selectedReview)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors ${
                  selectedReview.isVisible !== false
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {selectedReview.isVisible !== false ? "Hide Review" : "Show Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss Reports Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(dismissTarget)}
        onClose={() => setDismissTarget(null)}
        onConfirm={handleDismissReports}
        title="Dismiss Review Reports?"
        message={`This will clear all ${dismissTarget?.reportCount || 0} user flag reports and mark this review as verified safe.`}
        confirmText="Dismiss Reports"
        confirmVariant="success"
        isLoading={isDismissing}
      />

      {/* Delete Review Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteReview}
        title="Delete Review Permanently?"
        message="Are you sure you want to permanently delete this customer review? This will recalculate the station's average rating."
        confirmText="Delete Review"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
