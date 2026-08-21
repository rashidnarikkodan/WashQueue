import { Star } from "lucide-react"

interface ReviewItem {
  id: string
  name: string
  meta: string
  stars: number
  avatar?: string
  quote: string
}

interface StationReviewsSectionProps {
  rating?: number
  reviewCount?: number
  reviews?: ReviewItem[]
}

export function StationReviewsSection({
  rating = 0,
  reviewCount = 0,
  reviews = [],
}: StationReviewsSectionProps) {
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
            <div className="flex items-center gap-1 text-success">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-success text-success" />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-2">
              Average Rating
            </span>
          </div>

          <div className="md:col-span-3 space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl border border-border bg-card/90 space-y-4 shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {rev.avatar ? (
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="w-12 h-12 rounded-full object-cover border border-primary/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground font-bold">
                        {rev.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-foreground">{rev.name}</h4>
                      <p className="text-xs text-muted-foreground">{rev.meta}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-success">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} size={14} className="fill-success text-success" />
                    ))}
                  </div>
                </div>

                <p className="text-sm italic text-muted-foreground leading-relaxed">{rev.quote}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground text-sm border border-border rounded-2xl bg-card/60">
          No reviews yet for this station.
        </div>
      )}
    </div>
  )
}
