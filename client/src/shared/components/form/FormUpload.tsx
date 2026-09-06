import { useRef, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { Upload, FileText, X } from "lucide-react"

const resolveUrl = (url?: string): string => {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
}

interface FormUploadProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  variant?: "card" | "row"
  accept?: string
  subtext?: string
  error?: string
  id?: string
  icon?: ReactNode
  existingUrl?: string
}

export default function FormUpload({
  label,
  file,
  onChange,
  variant = "card",
  accept = "image/png, image/jpeg, application/pdf",
  subtext = "PNG, JPG, PDF UP TO 10MB",
  error,
  id,
  icon = <Upload size={20} className="text-primary" />,
  existingUrl,
}: FormUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPreview(null)
      return
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setLocalPreview(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0])
    }
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isPdf = existingUrl?.toLowerCase().endsWith(".pdf")
  const showExistingImage = existingUrl && !isPdf

  if (variant === "row") {
    const hasExisting = !file && !!existingUrl
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 text-left">
          {label}
        </label>
        <div
          onClick={triggerUpload}
          className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-300 group ${
            error
              ? "border-red-500/80 bg-red-500/5"
              : hasExisting
                ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                : "border-slate-800/80 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-900/40"
          }`}
        >
          <input
            id={id}
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
          />
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform shrink-0 group-hover:scale-105 ${hasExisting ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}
            >
              {hasExisting ? <FileText size={20} /> : icon}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {file ? file.name : hasExisting ? "Previously uploaded" : label}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {file
                  ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                  : hasExisting
                    ? "Click to replace"
                    : subtext}
              </p>
            </div>
          </div>
          {file ? (
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 rounded-full bg-slate-900 border border-slate-850 hover:bg-slate-850 flex items-center justify-center text-slate-450 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          ) : (
            <span
              className={`text-[10px] font-black uppercase border px-2.5 py-1.5 rounded-lg transition-all shrink-0 group-hover:bg-primary group-hover:text-primary-foreground ${hasExisting ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-primary border-primary/20 bg-primary/5"}`}
            >
              {hasExisting ? "Replace" : "Choose File"}
            </span>
          )}
        </div>

        {(localPreview || (existingUrl && showExistingImage)) && (
          <div className="mt-3 border border-slate-850 bg-slate-950/20 rounded-2xl p-4 flex items-center justify-center min-h-[150px] max-h-[220px] overflow-hidden animate-in fade-in duration-300">
            <img
              src={localPreview || resolveUrl(existingUrl)}
              alt="Upload Preview"
              className="max-w-full max-h-[180px] rounded-lg object-contain border border-slate-800"
            />
          </div>
        )}

        {((file && !file.type.startsWith("image/")) || (existingUrl && isPdf)) && (
          <div className="mt-3 border border-slate-850 bg-slate-950/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {file ? file.name : "KYC Document.pdf"}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "PDF Document"}
              </p>
            </div>
          </div>
        )}

        {error && (
          <span className="text-[11px] text-red-400 font-medium pl-1 text-left">{error}</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          onClick={triggerUpload}
          className={`group border-2 border-dashed rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-3 transition-all duration-300 cursor-pointer min-h-[220px] ${
            error
              ? "border-red-500/80 bg-red-500/5"
              : "border-slate-800 hover:border-primary/60 bg-slate-950/10 hover:bg-primary/5"
          }`}
        >
          <input
            id={id}
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
          />
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-850 group-hover:scale-105 transition-transform">
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              {file ? file.name : "Drag and drop your file here"}
            </p>
            <p className="text-xs text-slate-400">
              or <span className="text-primary font-bold">click to browse</span>
            </p>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {subtext}
          </span>
        </div>

        <div className="border border-slate-850 bg-slate-950/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[220px] overflow-hidden">
          {file ? (
            <div className="space-y-3 animate-in zoom-in duration-300 w-full flex flex-col items-center">
              {localPreview ? (
                <img
                  src={localPreview}
                  alt="Upload Preview"
                  className="max-w-full max-h-[140px] rounded-lg object-contain border border-slate-800"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto">
                  <FileText size={24} />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-bold text-white max-w-[200px] truncate">{file.name}</p>
                <p className="text-[11px] text-slate-500 font-semibold font-mono">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold tracking-wide transition-colors"
              >
                <X size={14} /> Remove file
              </button>
            </div>
          ) : existingUrl && showExistingImage ? (
            <div className="space-y-3 animate-in zoom-in duration-300 w-full flex flex-col items-center">
              <img
                src={resolveUrl(existingUrl)}
                alt="Upload Preview"
                className="max-w-full max-h-[140px] rounded-lg object-contain border border-slate-800"
              />
              <p className="text-[11px] text-slate-500 font-semibold">Previously Uploaded</p>
            </div>
          ) : existingUrl ? (
            <div className="space-y-3 animate-in zoom-in duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto">
                <FileText size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-300">Previously Uploaded</p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Upload a new file to replace
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mx-auto text-slate-600">
                <FileText size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-300">Document Preview</h4>
                <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed font-semibold">
                  Your uploaded document preview will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {error && (
        <span className="text-[11px] text-red-400 font-medium pl-1 text-left">{error}</span>
      )}
    </div>
  )
}
