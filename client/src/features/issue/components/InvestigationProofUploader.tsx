import { useState, useRef } from "react"
import { CloudUpload, X, File, Loader2 } from "lucide-react"
import type { Evidence } from "../types/issue.types"

interface InvestigationProofUploaderProps {
  existingProof?: Evidence[]
  onUploadProof: (evidence: Evidence[]) => void
  isUploading?: boolean
  readOnly?: boolean
}

export default function InvestigationProofUploader({
  existingProof = [],
  onUploadProof,
  isUploading = false,
  readOnly = false,
}: InvestigationProofUploaderProps) {
  const [proofList, setProofList] = useState<Evidence[]>(existingProof)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newEvidence: Evidence[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // Create local object URL for preview or upload
      const localUrl = URL.createObjectURL(file)
      newEvidence.push({
        public_id: `proof-${Date.now()}-${i}`,
        url: localUrl,
        description: file.name,
      })
    }

    const updated = [...proofList, ...newEvidence]
    setProofList(updated)
    onUploadProof(updated)
  }

  const handleRemove = (id: string) => {
    const updated = proofList.filter((p) => p.public_id !== id)
    setProofList(updated)
    onUploadProof(updated)
  }

  return (
    <div className="space-y-3 text-left">
      {!readOnly && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 sm:p-10 rounded-3xl border-2 border-dashed border-border/80 bg-card hover:bg-muted/30 hover:border-primary/40 transition-all cursor-pointer text-center space-y-3 group shadow-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <CloudUpload className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Add Investigation Proof</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Drag and drop CCTV footage, staff reports, or additional photos here
            </p>
          </div>
        </div>
      )}

      {/* Proof Gallery / List */}
      {proofList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {proofList.map((item) => (
            <div
              key={item.public_id}
              className="relative p-2.5 rounded-2xl bg-muted/40 border border-border flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-card border border-border/60 flex items-center justify-center shrink-0">
                {item.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || item.url.startsWith("blob:") ? (
                  <img src={item.url} alt="Proof" className="w-full h-full object-cover" />
                ) : (
                  <File className="w-5 h-5 text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground truncate block">
                  {item.description || "Investigation file"}
                </span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Proof file
                </span>
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(item.public_id)
                  }}
                  className="p-1 rounded-full bg-card hover:bg-destructive text-muted-foreground hover:text-white border border-border transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
