import { useState } from "react"
import { Maximize2, ImageOff } from "lucide-react"
import type { StationImage } from "../../types"

interface StationHeroGalleryProps {
  images?: StationImage[]
  stationName: string
}

export function StationHeroGallery({ images = [], stationName }: StationHeroGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showFullGallery, setShowFullGallery] = useState(false)

  const hasImages = images && images.length > 0
  const activeImage = hasImages ? images[selectedIndex]?.url || images[0]?.url : ""

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-card border border-border shadow-2xl flex items-center justify-center group">
        {hasImages ? (
          <>
            <img
              src={activeImage}
              alt={`${stationName} photo ${selectedIndex + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            <button
              onClick={() => setShowFullGallery(true)}
              className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md border border-white/10 text-foreground p-2.5 rounded-full hover:bg-card transition-all cursor-pointer shadow-lg z-10"
              title="View full gallery"
            >
              <Maximize2 size={18} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-8 text-center">
            <ImageOff size={48} className="opacity-60" />
            <span className="text-xs font-bold tracking-wider uppercase">No Images Provided</span>
          </div>
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-44 h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "border-primary ring-4 ring-primary/10 shadow-lg"
                    : "border-border opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={`${stationName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      {showFullGallery && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center items-center gap-4 animate-in fade-in duration-200">
          <button
            onClick={() => setShowFullGallery(false)}
            className="absolute top-6 right-6 text-foreground text-xs font-bold bg-muted hover:bg-border px-4 py-2 rounded-xl cursor-pointer"
          >
            Close Gallery
          </button>
          <div className="max-h-[85vh] max-w-[90vw] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`${stationName} gallery photo ${idx + 1}`}
                className="w-full h-64 object-cover rounded-2xl border border-border"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
