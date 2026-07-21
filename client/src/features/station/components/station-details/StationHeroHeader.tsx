import { useState } from "react"
import { Star, Clock, Edit3, Pause, Play, Share2, Maximize2, ShieldCheck, ImageOff } from "lucide-react"
import type { Station } from "../../types"
import { STATION_STATUS } from "../../types"

interface StationHeroHeaderProps {
  station: Station
  onEdit: () => void
  onToggleStatus: () => void
  isSubmitting?: boolean
}

export default function StationHeroHeader({
  station,
  onEdit,
  onToggleStatus,
  isSubmitting = false,
}: StationHeroHeaderProps) {
  const [showFullGallery, setShowFullGallery] = useState(false)

  const isVerified = station.status === STATION_STATUS.ACTIVE
  const stationCode = `WQ-${(station.id || "8824").slice(-6).toUpperCase()}`

  const hasImages = station.images && station.images.length > 0
  const primaryImage = hasImages ? station.images[0].url : ""
  const subImages = hasImages && station.images.length > 1 ? station.images.slice(1, 3).map((img) => img.url) : []

  return (
    <header className="grid grid-cols-12 gap-8 lg:gap-12 items-end">
      {/* Left Column: Title & Info */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3.5 py-1 bg-[#00a74b]/15 text-[#4ae176] border border-[#4ae176]/30 text-[10px] font-bold tracking-widest uppercase rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4ae176] rounded-full animate-ping"></span>
            <ShieldCheck size={12} />
            <span>{isVerified ? "Verified Station" : station.status.replace("_", " ")}</span>
          </span>
          <span className="text-[#8c909f] text-xs font-semibold uppercase tracking-wider">
            ID: {stationCode}
          </span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#dce1fb] leading-[1.15] tracking-tight">
            {station.name} <br />
            <span className="text-[#adc6ff]">HydroStream Hub</span>
          </h1>
          {station.description && (
            <p className="text-sm sm:text-base text-[#c2c6D6] opacity-80 mt-3 max-w-2xl">
              {station.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-[#c2c6d6]">
          <div className="flex items-center gap-1.5">
            <Star size={18} className="text-[#4ae176] fill-[#4ae176]" />
            <span className="text-lg font-bold text-white">{station.rating || 4.92}</span>
            <span className="text-[#8c909f]">({station.reviewCount || 2401} reviews)</span>
          </div>
          <div className="w-px h-5 bg-[#424754]"></div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#adc6ff]" />
            <span>Open 24/7 • Next Peak: 17:00</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={onEdit}
            className="bg-[#adc6ff] text-[#002e6a] hover:bg-blue-300 px-8 py-3.5 rounded-xl font-bold flex items-center gap-2.5 shadow-lg shadow-blue-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Edit3 size={18} />
            <span>Edit Station</span>
          </button>

          <button
            onClick={onToggleStatus}
            disabled={isSubmitting}
            className="bg-[#3e495d] text-[#aeb9d0] hover:bg-[#2e3447] hover:text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {station.status === STATION_STATUS.ACTIVE ? <Pause size={18} /> : <Play size={18} />}
            <span>{station.status === STATION_STATUS.ACTIVE ? "Pause Operations" : "Activate Station"}</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: station.name, url: window.location.href })
              } else {
                navigator.clipboard.writeText(window.location.href)
              }
            }}
            className="text-[#adc6ff] hover:bg-[#adc6ff]/10 px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Right Column: Hero Media Showcase */}
      <div className="col-span-12 lg:col-span-5 relative group">
        <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-[#151b2d] border border-white/5 shadow-2xl relative flex items-center justify-center">
          {hasImages ? (
            <>
              <img
                src={primaryImage}
                alt={station.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324]/80 via-transparent to-transparent"></div>

              {/* Sub Thumbnails Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex -space-x-3">
                  {subImages.map((img, idx) => (
                    <div key={idx} className="w-14 h-14 rounded-xl border-2 border-[#0c1324] overflow-hidden shadow-md">
                      <img src={img} alt="Station preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {station.images.length > 3 && (
                    <div className="w-14 h-14 rounded-xl border-2 border-[#0c1324] bg-[#2e3447] text-white flex items-center justify-center text-xs font-bold shadow-md">
                      +{station.images.length - 3}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowFullGallery(true)}
                  className="bg-[#0c1324]/80 backdrop-blur-md border border-white/10 text-white p-2.5 rounded-full hover:bg-[#0c1324] transition-all cursor-pointer shadow-lg"
                  title="Full screen"
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-[#8c909f] p-8 text-center">
              <ImageOff size={44} className="opacity-60" />
              <span className="text-sm font-bold tracking-wide uppercase opacity-75">No Image</span>
            </div>
          )}
        </div>

        {/* Fullscreen Lightbox Modal */}
        {showFullGallery && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center items-center gap-4">
            <button
              onClick={() => setShowFullGallery(false)}
              className="absolute top-6 right-6 text-white text-sm bg-slate-800 px-4 py-2 rounded-xl"
            >
              Close Gallery
            </button>
            <img src={primaryImage} alt="Main view" className="max-h-[75vh] max-w-[90vw] rounded-2xl object-contain" />
          </div>
        )}
      </div>
    </header>
  )
}
