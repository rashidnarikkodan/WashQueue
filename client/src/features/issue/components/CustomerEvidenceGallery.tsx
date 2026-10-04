import { useState } from "react"
import { X, ZoomIn } from "lucide-react"
import type { Evidence } from "../types/issue.types"

interface CustomerEvidenceGalleryProps {
  evidence?: Evidence[]
}

export default function CustomerEvidenceGallery({ evidence = [] }: CustomerEvidenceGalleryProps) {
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  if (!evidence || evidence.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 text-left">
      <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
        CUSTOMER EVIDENCE ({evidence.length} PHOTO{evidence.length === 1 ? "" : "S"})
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {evidence.map((item, idx) => (
          <div
            key={item.public_id || idx}
            onClick={() => setActivePhoto(item.url)}
            className="group relative aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted/40 cursor-pointer shadow-sm hover:border-primary/50 transition-all"
          >
            <img
              src={item.url}
              alt={item.description || `Evidence photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-2 rounded-xl bg-card/80 backdrop-blur-sm text-foreground border border-border">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>
            {item.description && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-[10px] text-white truncate">
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhoto}
              alt="Evidence preview"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
