import React, { useState } from "react"
import { X, Sparkles, Loader2, BookOpen } from "lucide-react"
import { toast } from "sonner"
import type {
  CreateKnowledgeDocumentPayload,
  KnowledgeDocumentCategory,
  KnowledgeDocumentStatus,
} from "../types/knowledge-docs.types"
import { knowledgeDocsApi } from "../api/knowledge-docs.api"
import SelectInput from "@/shared/components/form/SelectInput"

interface CreateKnowledgeDocModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES: KnowledgeDocumentCategory[] = [
  "FAQ",
  "POLICY",
  "SERVICE",
  "BOOKING",
  "PAYMENT",
  "QUEUE",
  "SUPPORT",
]

export const CreateKnowledgeDocModal: React.FC<CreateKnowledgeDocModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<KnowledgeDocumentCategory>("FAQ")
  const [status, setStatus] = useState<KnowledgeDocumentStatus>("PUBLISHED")
  const [locale, setLocale] = useState("en")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Please enter a document title")
      return
    }
    if (!content.trim() || content.trim().length < 20) {
      toast.error("Content must be at least 20 characters long")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateKnowledgeDocumentPayload = {
        title: title.trim(),
        category,
        status,
        locale: locale.trim() || "en",
        content: content.trim(),
      }
      await knowledgeDocsApi.create(payload)
      toast.success("Knowledge document created and indexed successfully")
      onSuccess()
      onClose()
      // Reset form
      setTitle("")
      setContent("")
      setCategory("FAQ")
      setStatus("PUBLISHED")
    } catch {
      toast.error("Failed to create knowledge document")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Create Knowledge Document</h2>
              <p className="text-xs text-muted-foreground">
                Add content to vectorize and index into the RAG assistant knowledge base
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deluxe Polish & Ceramic Coating Warranty Policy"
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectInput
              label="Category"
              value={category}
              onChange={(val) => setCategory(val as KnowledgeDocumentCategory)}
              options={CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
            />

            <SelectInput
              label="Status"
              value={status}
              onChange={(val) => setStatus(val as KnowledgeDocumentStatus)}
              options={[
                { label: "Published (Vectorized)", value: "PUBLISHED" },
                { label: "Draft", value: "DRAFT" },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Locale</label>
              <input
                type="text"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                placeholder="en"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Knowledge Content (Markdown / Text) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the detailed information, instructions, FAQs, terms, or guidelines here. This text will be chunked, embedded, and retrieved by the AI assistant..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-y leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Minimum 20 characters. Include clear sections, rules, and actionable instructions.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Indexing & Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Save &amp; Index Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateKnowledgeDocModal
