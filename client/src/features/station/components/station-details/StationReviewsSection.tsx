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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Reviews &amp; Ratings
        </h2>
        {reviewCount > 0 && (
          <span className="text-sm font-bold text-blue-400">
            {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
          </span>
        )}
      </div>

      {/* Reviews Content Layout */}
      {reviewCount > 0 || reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Average Rating Card (1 Column) */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
            <span className="text-6xl font-black text-blue-400 tracking-tighter">
              {rating ? rating.toFixed(1) : "0.0"}
            </span>
            <div className="flex items-center gap-1 text-emerald-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-emerald-400 text-emerald-400" />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">
              Average Rating
            </span>
          </div>

          {/* Customer Reviews List (3 Columns) */}
          <div className="md:col-span-3 space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {rev.avatar ? (
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="w-12 h-12 rounded-full object-cover border border-blue-500/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                        {rev.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-slate-100">{rev.name}</h4>
                      <p className="text-xs text-slate-400">{rev.meta}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-400">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} size={14} className="fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                </div>

                <p className="text-sm italic text-slate-300 leading-relaxed">
                  {rev.quote}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-sm border border-slate-800 rounded-2xl bg-slate-900/60">
          No reviews yet for this station.
        </div>
      )}
    </div>
  )
}
