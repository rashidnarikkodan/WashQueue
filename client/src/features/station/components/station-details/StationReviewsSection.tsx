import { useState, useEffect } from "react"
import { Star, MessageSquare } from "lucide-react"
import { reviewApi } from "@/shared/apis/review.api"
import type { ReviewDto } from "@/shared/types/review.types"

interface StationReviewsSectionProps {
  stationId?: string
  rating?: number
  reviewCount?: number
}

export function StationReviewsSection({
  stationId,
  rating: initialRating = 0,
  reviewCount: initialReviewCount = 0,
}: StationReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [fetchedRating, setFetchedRating] = useState<number | null>(null)
  const [fetchedReviewCount, setFetchedReviewCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(stationId))

  useEffect(() => {
    if (!stationId) return

    let isMounted = true

    reviewApi
      .getStationReviews(stationId, 1, 10)
      .then((res) => {
        if (!isMounted) return
        if (res) {
          setReviews(res.reviews || [])
          if (res.reviewCount > 0) {
            setFetchedRating(res.averageRating)
            setFetchedReviewCount(res.reviewCount)
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [stationId])

  const rating = fetchedRating !== null ? fetchedRating : initialRating
  const reviewCount = fetchedReviewCount !== null ? fetchedReviewCount : initialReviewCount

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Reviews &amp; Ratings</h2>
        {reviewCount > 0 && (
          <span className="text-sm font-bold text-primary">
            {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
          </span>
        )}
      </div>

      {reviewCount > 0 || reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-8 rounded-2xl border border-border bg-card/90 flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
            <span className="text-6xl font-black text-primary tracking-tighter">
              {rating ? rating.toFixed(1) : "0.0"}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={
                    i < Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30 fill-transparent"
                  }
                />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-2">
              Average Rating
            </span>
          </div>

          <div className="md:col-span-3 space-y-4">
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

              return (
                <div
                  key={rev.id}
                  className="p-6 rounded-2xl border border-border bg-card/90 space-y-4 shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-12 h-12 rounded-full object-cover border border-primary/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-bold text-foreground">{userName}</h4>
                        <p className="text-xs text-muted-foreground">{dateFormatted}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/20 fill-transparent"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {rev.comment ? (
                    <p className="text-sm italic text-muted-foreground leading-relaxed">
                      "{rev.comment}"
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">
                      Customer left a {rev.rating}-star rating.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground text-sm border border-border rounded-2xl bg-card/60 flex flex-col items-center justify-center gap-2">
          <MessageSquare size={24} className="text-muted-foreground/40" />
          <span>{isLoading ? "Loading reviews..." : "No reviews yet for this station."}</span>
        </div>
      )}
    </div>
  )
}
