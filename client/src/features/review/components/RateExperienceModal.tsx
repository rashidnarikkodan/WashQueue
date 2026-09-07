import React, { useState } from "react"
import { Star, X, Send, Sparkles, Loader2, CheckCircle2, Info, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useReviewModalStore } from "../store/review-modal.store"
import { reviewApi } from "@/shared/apis/review.api"
import type { ReviewDto, ReviewPromptData } from "@/shared/types/review.types"

const MAX_REVIEW_EDITS = 2

const RATING_SENTIMENTS = [
  {
    stars: 1,
    label: "Poor",
    desc: "We're sorry to hear that",
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    stars: 2,
    label: "Fair",
    desc: "Could have been better",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    stars: 3,
    label: "Good",
    desc: "Satisfactory service",
    color: "text-sky-600 dark:text-sky-400",
  },
  {
    stars: 4,
    label: "Very Good",
    desc: "Great experience!",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    stars: 5,
    label: "Excellent",
    desc: "Outstanding wash & service! ✨",
    color: "text-emerald-600 dark:text-emerald-400",
  },
]

const QUICK_TAGS = [
  "Super Clean",
  "Fast Service",
  "Polite Staff",
  "Great Value",
  "Mirror Shine",
  "Spotless Glass",
]

interface RateExperienceFormProps {
  bookingData: ReviewPromptData
  existingReview: ReviewDto | null
  onSuccess?: (review: ReviewDto) => void
  onClose: () => void
}

function RateExperienceForm({
  bookingData,
  existingReview,
  onSuccess,
  onClose,
}: RateExperienceFormProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState<string>(existingReview?.comment || "")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const remainingEdits = existingReview
    ? Math.max(0, MAX_REVIEW_EDITS - (existingReview.updateCount || 0))
    : MAX_REVIEW_EDITS
  const isEditLimitReached = Boolean(existingReview && remainingEdits <= 0)

  const activeRating = hoverRating !== null ? hoverRating : rating
  const sentiment = RATING_SENTIMENTS.find((s) => s.stars === activeRating) || RATING_SENTIMENTS[4]

  const handleQuickTagClick = (tag: string) => {
    const cleanTag = tag.replace(/^[^\s]+\s/, "")
    if (comment.includes(cleanTag)) return
    setComment((prev) => (prev ? `${prev}, ${cleanTag}` : cleanTag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingData?.bookingId) return

    if (existingReview && remainingEdits <= 0) {
      toast.error("You have reached the maximum limit of 2 edits for this review")
      return
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars")
      return
    }

    setIsSubmitting(true)
    try {
      let savedReview
      if (existingReview?.id) {
        savedReview = await reviewApi.updateReview(existingReview.id, {
          rating,
          comment: comment.trim(),
        })
        toast.success("Thank you! Your review has been updated.")
      } else {
        savedReview = await reviewApi.createReview({
          bookingId: bookingData.bookingId,
          rating,
          comment: comment.trim(),
        })
        toast.success("Thank you! Your review has been submitted.")
      }

      if (onSuccess && savedReview) {
        onSuccess(savedReview)
      }

      onClose()
    } catch {
      // Handled by handleApiError
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="relative w-full max-w-lg bg-card text-card-foreground border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        aria-label="Close modal"
      >
        <X size={18} />
      </button>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {existingReview ? "Update Your Review" : "Rate Your Experience"}
            </h2>
            <Sparkles size={20} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {existingReview ? (
              <span>
                Modify your rating or feedback •{" "}
                <span
                  className={
                    remainingEdits === 0
                      ? "text-rose-600 dark:text-rose-400 font-bold"
                      : remainingEdits === 1
                        ? "text-amber-600 dark:text-amber-400 font-bold"
                        : "text-primary font-bold"
                  }
                >
                  {remainingEdits} edit{remainingEdits === 1 ? "" : "s"} left
                </span>
              </span>
            ) : (
              "Help improve WashQueue services with your feedback"
            )}
          </p>
        </div>

        {/* Edit Quota Notice */}
        {existingReview && (
          <div>
            {remainingEdits === 2 && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs">
                <Info size={15} className="shrink-0" />
                <span>
                  Reviews can be edited up to 2 times. You have <strong>2 edits left</strong>.
                </span>
              </div>
            )}
            {remainingEdits === 1 && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                <AlertCircle size={15} className="shrink-0" />
                <span>
                  <strong>1 edit left:</strong> Submitting this will be your final edit for this
                  review.
                </span>
              </div>
            )}
            {remainingEdits === 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                <AlertCircle size={15} className="shrink-0" />
                <span>
                  <strong>Edit limit reached (0 left):</strong> You have reached the maximum of 2
                  edits for this review.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Booking / Station Overview Banner */}
        <div className="p-4 rounded-2xl bg-muted/70 border border-border flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {bookingData.stationImage ? (
              <img
                src={bookingData.stationImage}
                alt={bookingData.stationName || "Station"}
                className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shrink-0 text-base">
                {bookingData.stationName ? bookingData.stationName.charAt(0).toUpperCase() : "W"}
              </div>
            )}

            <div className="min-w-0 space-y-0.5">
              <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                {bookingData.stationName || "Wash Station"}
              </h3>
              <p className="text-xs font-semibold text-primary truncate">
                {bookingData.serviceType || "Car Wash Service"}
              </p>
              {bookingData.dateTime && (
                <p className="text-[11px] text-muted-foreground truncate">{bookingData.dateTime}</p>
              )}
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 size={11} />
            Completed
          </span>
        </div>

        {/* Star Rating Section */}
        <div className="flex flex-col items-center justify-center space-y-3 py-1">
          <div
            className="flex items-center gap-2 sm:gap-3"
            onMouseLeave={() => setHoverRating(null)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeRating
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-1 sm:p-2 rounded-2xl transition-all duration-200 transform hover:scale-115 active:scale-95 focus:outline-none cursor-pointer"
                  aria-label={`${star} Star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    size={36}
                    className={`transition-all duration-200 ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.45)]"
                        : "text-muted-foreground/30 fill-transparent hover:text-amber-400/50"
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Sentiment label */}
          <div className="text-center h-8 flex flex-col items-center justify-center">
            <span className={`text-base font-extrabold tracking-tight ${sentiment.color}`}>
              {sentiment.label}
            </span>
            <span className="text-xs text-muted-foreground font-medium">{sentiment.desc}</span>
          </div>
        </div>

        {/* Quick Tag Suggestions */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Quick Feedback
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="text-xs px-3 py-1.5 rounded-xl bg-muted/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border text-foreground transition-all duration-150 font-medium cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Thoughts / Comment Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="review-comment"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Your Thoughts
            </label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {comment.length}/1000
            </span>
          </div>
          <textarea
            id="review-comment"
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Describe your experience at ${bookingData.stationName || "the station"}...`}
            className="w-full rounded-2xl bg-muted/50 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isEditLimitReached}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{existingReview ? "Updating Review..." : "Submitting Review..."}</span>
              </>
            ) : isEditLimitReached ? (
              <span>Edit Limit Reached (0 Left)</span>
            ) : (
              <>
                <span>
                  {existingReview ? `Update Review (${remainingEdits} left)` : "Submit Review"}
                </span>
                <Send size={16} className="translate-x-0.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full py-2 text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </form>
    </div>
  )
}

export function RateExperienceModal() {
  const { isOpen, bookingData, existingReview, closeReviewModal, onSuccess } = useReviewModalStore()

  if (!isOpen || !bookingData) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <RateExperienceForm
        key={`${bookingData.bookingId}-${existingReview?.id || "new"}`}
        bookingData={bookingData}
        existingReview={existingReview}
        onSuccess={onSuccess}
        onClose={closeReviewModal}
      />
    </div>
  )
}
