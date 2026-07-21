import { Star } from "lucide-react"

interface StationReviewsSectionProps {
  rating?: number
  reviewCount?: number
}

export function StationReviewsSection({ rating = 4.9, reviewCount = 124 }: StationReviewsSectionProps) {
  const reviews = [
    {
      id: "rev-1",
      name: "Elena Rodriguez",
      meta: "Verified Customer • 2 days ago",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      quote:
        '"Best wash in the city. The live queue feature saved me at least 45 minutes of waiting around. The ceramic finish is incredible!"',
    },
    {
      id: "rev-2",
      name: "Marcus Chen",
      meta: "Verified Customer • 1 week ago",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      quote:
        '"Excellent attention to detail. I\'m very particular about my rims and they did a spotless job. Worth every penny."',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Reviews &amp; Ratings
        </h2>
        <button className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
          View All {reviewCount} Reviews
        </button>
      </div>

      {/* Reviews Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Average Rating Card (1 Column) */}
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
          <span className="text-6xl font-black text-blue-400 tracking-tighter">
            {rating}
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
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-12 h-12 rounded-full object-cover border border-blue-500/20"
                  />
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
    </div>
  )
}
