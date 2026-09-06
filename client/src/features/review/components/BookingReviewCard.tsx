import { useState, useEffect } from "react"
import { Star, MessageSquareQuote, Edit3, Sparkles } from "lucide-react"
import { reviewApi } from "@/shared/apis/review.api"
import type { ReviewDto } from "@/shared/types/review.types"
import { useReviewModalStore } from "../store/review-modal.store"

interface BookingReviewCardProps {
  bookingId: string
  stationId: string
  stationName: string
  stationImage?: string
  serviceType: string
  dateTime: string
  bookingNumber: string
  bookingStatus: string
}

const RATING_SENTIMENTS: Record<number, { label: string; color: string; desc: string }> = {
  1: {
    label: "Poor",
    color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    desc: "Needs improvement",
  },
  2: {
    label: "Fair",
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    desc: "Satisfactory with caveats",
  },
  3: {
    label: "Good",
    color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
    desc: "Solid wash experience",
  },
  4: {
    label: "Very Good",
    color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    desc: "Great quality & service",
  },
  5: {
    label: "Excellent",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    desc: "Outstanding wash experience! ✨",
  },
}

export function BookingReviewCard({
  bookingId,
  stationId,
  stationName,
  stationImage,
  serviceType,
  dateTime,
  bookingNumber,
  bookingStatus,
}: BookingReviewCardProps) {
  const [review, setReview] = useState<ReviewDto | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(bookingStatus === "COMPLETED")
  const openReviewModal = useReviewModalStore((state) => state.openReviewModal)

  useEffect(() => {
    if (bookingStatus !== "COMPLETED") {
      return
    }

    let isMounted = true
    reviewApi
      .getByBooking(bookingId)
      .then((existing) => {
        if (isMounted) {
          setReview(existing)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setReview(null)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [bookingId, bookingStatus])

  if (bookingStatus !== "COMPLETED") {
    return null
  }

  const handleOpenModal = () => {
    openReviewModal(
      {
        bookingId,
        stationId,
        stationName,
        stationImage,
        serviceType,
        dateTime,
        bookingNumber,
      },
      review,
      (savedReview) => {
        setReview(savedReview)
      }
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl border border-border bg-card/60 animate-pulse space-y-4">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-16 bg-muted/50 rounded-2xl" />
      </div>
    )
  }

  if (!review) {
    return (
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
              <h3 className="text-base font-bold text-foreground">How was your wash experience?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Help us and fellow drivers know how {stationName} performed.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Star size={15} className="fill-amber-300 text-amber-300" />
            <span>Rate Experience</span>
          </button>
        </div>
      </div>
    )
  }

  const sentiment = RATING_SENTIMENTS[review.rating] || RATING_SENTIMENTS[5]

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <MessageSquareQuote size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Your Rating &amp; Review</h3>
            <span className="text-[11px] text-muted-foreground">
              {review.updatedAt
                ? `Updated ${new Date(review.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : review.createdAt
                  ? `Reviewed ${new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "Verified Customer Review"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-3.5 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Edit3 size={13} className="text-primary" />
          <span>Edit Review</span>
        </button>
      </div>

      {/* Rating Stars & Sentiment */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              className={
                star <= review.rating
                  ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]"
                  : "text-muted-foreground/30 fill-transparent"
              }
            />
          ))}
        </div>
        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${sentiment.color}`}>
          {sentiment.label} ({review.rating}/5)
        </span>
        {review.updateCount > 0 && (
          <span className="text-[10px] text-muted-foreground font-mono">(edited)</span>
        )}
      </div>

      {/* Review Comment Body */}
      {review.comment ? (
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80">
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
            "{review.comment}"
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No detailed comments added.</p>
      )}
    </div>
  )
}
