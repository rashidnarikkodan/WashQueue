import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  Copy,
  Check,
  Clock,
  Sparkles,
  Save,
  X,
  Loader2,
  ChevronDown,
  Globe,
} from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { knowledgeDocsApi } from "../api/knowledge-docs.api"
import KnowledgeDocStatusBadge from "../components/KnowledgeDocStatusBadge"
import type {
  KnowledgeDocument,
  KnowledgeDocumentCategory,
  KnowledgeDocumentStatus,
  UpdateKnowledgeDocumentPayload,
} from "../types/knowledge-docs.types"
import { KNOWLEDGE_DOC_CATEGORIES } from "../constants/knowledge-doc-categories.const"

export default function KnowledgeDocumentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [document, setDocument] = useState<KnowledgeDocument | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  // Edit State
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editTitle, setEditTitle] = useState<string>("")
  const [editCategory, setEditCategory] = useState<KnowledgeDocumentCategory>("FAQ")
  const [editStatus, setEditStatus] = useState<KnowledgeDocumentStatus>("PUBLISHED")
  const [editContent, setEditContent] = useState<string>("")
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.max(el.scrollHeight, 260)}px`
  }, [])

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight()
    }
  }, [isEditing, editContent, adjustTextareaHeight])

  const fetchDocument = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const doc = await knowledgeDocsApi.getById(id)
      if (doc) {
        setDocument(doc)
        setEditTitle(doc.title)
        setEditCategory(doc.category)
        setEditStatus(doc.status)
        setEditContent(doc.content)
      } else {
        toast.error("Knowledge document not found")
      }
    } catch {
      toast.error("Failed to load knowledge document details")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchDocument()
    })
    return () => {
      ignore = true
    }
  }, [fetchDocument])

  const handleCopyContent = () => {
    if (!document?.content) return
    navigator.clipboard.writeText(document.content)
    setIsCopied(true)
    toast.success("Content copied to clipboard")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleToggleEditMode = () => {
    if (isEditing) {
      handleDiscard()
    } else {
      if (document) {
        setEditTitle(document.title)
        setEditCategory(document.category)
        setEditStatus(document.status)
        setEditContent(document.content)
      }
      setIsEditing(true)
    }
  }

  const handleDiscard = () => {
    if (document) {
      setEditTitle(document.title)
      setEditCategory(document.category)
      setEditStatus(document.status)
      setEditContent(document.content)
    }
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!id || !document) return
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty")
      return
    }
    if (!editContent.trim()) {
      toast.error("Content cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      const payload: UpdateKnowledgeDocumentPayload = {
        title: editTitle.trim(),
        category: editCategory,
        status: editStatus,
        content: editContent.trim(),
      }
      const updated = await knowledgeDocsApi.update(id, payload)
      setDocument(updated)
      setIsEditing(false)
      toast.success("Knowledge document updated and re-indexed")
    } catch {
      toast.error("Failed to update knowledge document")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await knowledgeDocsApi.delete(id)
      toast.success("Document deleted successfully")
      navigate(APP_ROUTES.ADMIN.KNOWLEDGE_DOCS)
    } catch {
      toast.error("Failed to delete document")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading document details...</p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-8 space-y-4">
        <div className="p-3.5 rounded-2xl bg-muted text-muted-foreground">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Document Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1">
            The requested knowledge document does not exist or may have been deleted.
          </p>
        </div>
        <button
          onClick={() => navigate(APP_ROUTES.ADMIN.KNOWLEDGE_DOCS)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-2 pb-16 space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      <Breadcrumbs
        items={[
          { label: "Admin", path: APP_ROUTES.ADMIN.DASHBOARD },
          { label: "Knowledge Base", path: APP_ROUTES.ADMIN.KNOWLEDGE_DOCS },
          { label: isEditing && editTitle.trim() ? editTitle : document.title },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto flex-1 min-w-0">
          {/* Title - Headings in read mode, inline editable in edit mode */}
          {isEditing ? (
            <div className="relative">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Document Title"
                className="text-xl sm:text-2xl font-black tracking-tight text-foreground bg-transparent border-0 border-b border-dashed border-primary/40 hover:border-primary/60 focus:border-primary outline-none focus:ring-0 w-full py-0.5 transition-colors placeholder:text-muted-foreground/30"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {document.title}
              </h1>
              <KnowledgeDocStatusBadge status={document.status} />
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap shrink-0">
          {/* Edit Mode Switch */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border bg-card/65 backdrop-blur-sm">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 select-none">
              <Edit3
                className={`w-3.5 h-3.5 transition-colors ${
                  isEditing ? "text-primary" : "text-muted-foreground"
                }`}
              />
              Edit Mode
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isEditing}
              onClick={handleToggleEditMode}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEditing ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/40"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isEditing ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {isEditing ? (
            <>
              <button
                onClick={handleDiscard}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Discard
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCopyContent}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Copy Content
                  </>
                )}
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 rounded-xl border border-border bg-card hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metadata Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm space-y-1">
          <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Created At
          </p>
          <p className="text-xs font-bold text-foreground">
            {new Date(document.createdAt).toLocaleDateString()}{" "}
            {new Date(document.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm space-y-1">
          <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-500" /> Published At
          </p>
          <p className="text-xs font-bold text-foreground">
            {document.publishedAt ? (
              <>
                {new Date(document.publishedAt).toLocaleDateString()}{" "}
                {new Date(document.publishedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            ) : isEditing && editStatus === "PUBLISHED" ? (
              <span className="text-emerald-500 font-semibold text-[11px]">
                Will publish on save
              </span>
            ) : (
              <span className="text-muted-foreground font-medium italic">Not published</span>
            )}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm space-y-1">
          <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Last Updated
          </p>
          <p className="text-xs font-bold text-foreground">
            {new Date(document.updatedAt).toLocaleDateString()}{" "}
            {new Date(document.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm space-y-1">
          <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Domain Category
          </p>
          {isEditing ? (
            <div className="relative inline-flex items-center w-full group">
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as KnowledgeDocumentCategory)}
                className="appearance-none bg-transparent hover:bg-muted/40 cursor-pointer text-xs font-bold text-foreground border-b border-dashed border-primary/40 focus:border-primary outline-none w-full py-0.5 pr-6 transition-colors"
              >
                {KNOWLEDGE_DOC_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-popover text-popover-foreground">
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-0 pointer-events-none group-hover:text-foreground transition-colors" />
            </div>
          ) : (
            <p className="text-xs font-bold text-foreground">{document.category}</p>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm space-y-1">
          <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Vector State
          </p>
          {isEditing ? (
            <div className="relative inline-flex items-center w-full group">
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as KnowledgeDocumentStatus)}
                className="appearance-none bg-transparent hover:bg-muted/40 cursor-pointer text-xs font-bold text-foreground border-b border-dashed border-primary/40 focus:border-primary outline-none w-full py-0.5 pr-6 transition-colors"
              >
                <option value="PUBLISHED" className="bg-popover text-popover-foreground">
                  Published (Indexed in Qdrant)
                </option>
                <option value="DRAFT" className="bg-popover text-popover-foreground">
                  Draft (Excluded from Qdrant)
                </option>
                <option value="ARCHIVED" className="bg-popover text-popover-foreground">
                  Archived (Excluded from Qdrant)
                </option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-0 pointer-events-none group-hover:text-foreground transition-colors" />
            </div>
          ) : (
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              {document.status === "PUBLISHED" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>Indexed in Qdrant</span>
                </>
              )}
              {document.status === "DRAFT" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span>Draft (Excluded)</span>
                </>
              )}
              {document.status === "ARCHIVED" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  <span>Archived (Excluded)</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-3xl border border-border/80 bg-card/65 backdrop-blur-sm p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Document Body
            </h3>
            {isEditing && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Editing
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            {(isEditing ? editContent : document.content).length} characters •{" "}
            {
              (isEditing ? editContent : document.content).trim().split(/\s+/).filter(Boolean)
                .length
            }{" "}
            words
          </span>
        </div>

        {isEditing ? (
          <div className="pt-2">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write document content..."
              className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-foreground font-sans text-xs sm:text-sm leading-relaxed p-0 resize-none placeholder:text-muted-foreground/30 transition-colors"
              style={{ minHeight: "260px" }}
            />
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm pt-2">
            {document.content}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Knowledge Document?"
        message={`Are you sure you want to delete "${document.title}"? This will permanently erase the document and delete its vector embeddings from Qdrant.`}
        confirmText="Delete Document"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
