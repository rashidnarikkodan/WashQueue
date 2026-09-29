import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  RefreshCw,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
} from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import {
  DataTable,
  type Column,
  type TabConfig,
  type SelectFilter,
  type PaginationMeta,
} from "@/shared/components/data-table"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { knowledgeDocsApi } from "../api/knowledge-docs.api"
import type { KnowledgeDocument } from "../types/knowledge-docs.types"
import KnowledgeDocStatusBadge from "../components/KnowledgeDocStatusBadge"
import KnowledgeDocCategoryBadge from "../components/KnowledgeDocCategoryBadge"
import CreateKnowledgeDocModal from "../components/CreateKnowledgeDocModal"

const STATUS_TABS: TabConfig[] = [
  { id: "ALL", label: "All Documents" },
  {
    id: "PUBLISHED",
    label: "Published (Live)",
    activeColor: "border-emerald-500 text-emerald-500",
  },
  { id: "DRAFT", label: "Drafts", activeColor: "border-amber-500 text-amber-500" },
  { id: "ARCHIVED", label: "Archived", activeColor: "border-slate-500 text-slate-500" },
]

export default function KnowledgeDocumentListPage() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeDocument | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const fetchDocuments = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const res = await knowledgeDocsApi.getAll({
          page,
          limit,
          search: searchQuery.trim() || undefined,
          status: activeTab !== "ALL" ? activeTab : undefined,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        })

        setDocuments(res.data || [])
        setTotalCount(res.total || 0)
      } catch {
        toast.error("Failed to load knowledge documents")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [page, limit, searchQuery, activeTab, categoryFilter]
  )

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchDocuments()
    })
    return () => {
      ignore = true
    }
  }, [fetchDocuments])

  const handleDeleteDocument = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await knowledgeDocsApi.delete(deleteTarget.id)
      toast.success(`"${deleteTarget.title}" deleted successfully`)
      setDeleteTarget(null)
      await fetchDocuments()
    } catch {
      toast.error("Failed to delete document")
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculated Stats
  const statItems: StatItem[] = useMemo(() => {
    const publishedCount = documents.filter((d) => d.status === "PUBLISHED").length
    const draftCount = documents.filter((d) => d.status === "DRAFT").length
    const uniqueCategories = new Set(documents.map((d) => d.category)).size

    return [
      {
        id: "total-docs",
        label: "Total Knowledge Documents",
        value: totalCount.toLocaleString(),
        variant: "primary",
        icon: FileText,
        description: "Indexed resources in knowledge base",
      },
      {
        id: "published-docs",
        label: "Published & Vectorized",
        value: publishedCount.toLocaleString(),
        variant: "emerald",
        icon: CheckCircle2,
        description: "Active in Qdrant semantic vector search",
      },
      {
        id: "draft-docs",
        label: "Draft Documents",
        value: draftCount.toLocaleString(),
        variant: "amber",
        icon: Clock,
        description: "Staged content awaiting publication",
      },
      {
        id: "categories-count",
        label: "Knowledge Domains",
        value: uniqueCategories.toString(),
        variant: "blue",
        icon: Layers,
        description: "Active operational categories",
      },
    ]
  }, [documents, totalCount])

  // Select Filters
  const selectFilters: SelectFilter[] = useMemo(() => {
    return [
      {
        id: "categoryFilter",
        label: "Domain / Category",
        value: categoryFilter,
        onChange: (val) => {
          setCategoryFilter(val)
          setPage(1)
        },
        options: [
          { label: "All Categories", value: "ALL" },
          { label: "FAQ (Customer Questions)", value: "FAQ" },
          { label: "Policy (Terms & Conditions)", value: "POLICY" },
          { label: "Service (Wash Tiers & Packages)", value: "SERVICE" },
          { label: "Booking (Scheduling & Slots)", value: "BOOKING" },
          { label: "Payment (Pricing & Refunds)", value: "PAYMENT" },
          { label: "Queue (Live Bay Flow)", value: "QUEUE" },
          { label: "Support (Help & Assistance)", value: "SUPPORT" },
        ],
      },
    ]
  }, [categoryFilter])

  // Table Columns
  const columns: Column<KnowledgeDocument>[] = useMemo(() => {
    return [
      {
        id: "title",
        header: "Document Title & Snippet",
        cell: (doc) => (
          <div className="py-1">
            <button
              onClick={() => navigate(APP_ROUTES.ADMIN.KNOWLEDGE_DOC_DETAILS(doc.id))}
              className="font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors text-left cursor-pointer flex items-center gap-1.5 group"
            >
              <span className="line-clamp-1">{doc.title}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0" />
            </button>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 max-w-lg">
              {doc.content}
            </p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: (doc) => <KnowledgeDocCategoryBadge category={doc.category} />,
      },
      {
        id: "status",
        header: "Status",
        cell: (doc) => <KnowledgeDocStatusBadge status={doc.status} />,
      },
      {
        id: "version",
        header: "Locale / Version",
        cell: (doc) => (
          <span className="font-mono text-xs font-semibold text-muted-foreground uppercase">
            {doc.locale || "en"} • v{doc.version || 1}
          </span>
        ),
      },
      {
        id: "updatedAt",
        header: "Last Updated",
        cell: (doc) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}{" "}
            {new Date(doc.updatedAt || doc.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        align: "right",
        cell: (doc) => (
          <div className="flex items-center justify-end gap-1.5 py-1">
            <button
              onClick={() => navigate(APP_ROUTES.ADMIN.KNOWLEDGE_DOC_DETAILS(doc.id))}
              title="View document content"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all cursor-pointer border border-border"
            >
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              View
            </button>
            <button
              onClick={() => setDeleteTarget(doc)}
              title="Delete document"
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ]
  }, [navigate])

  const totalPages = Math.ceil(totalCount / limit) || 1
  const paginationMeta: PaginationMeta = {
    total: totalCount,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <Breadcrumbs
        items={[{ label: "Admin", path: APP_ROUTES.ADMIN.DASHBOARD }, { label: "Knowledge Base" }]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Knowledge Base Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xl">
            Curate, index, and organize AI RAG documents, operational FAQs, service tiers, and
            system policies that power the intelligent customer assistant.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button
            onClick={() => fetchDocuments(true)}
            disabled={isRefreshing || isLoading}
            title="Refresh knowledge documents"
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Document
          </button>
        </div>
      </div>

      {/* Stats HUD */}
      <StatsHUD stats={statItems} columns={4} />

      {/* Generic Data Table */}
      <DataTable
        columns={columns}
        data={documents}
        rowKey={(d) => d.id}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setPage(1)
        }}
        searchPlaceholder="Search knowledge documents by title or content..."
        tabs={STATUS_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setPage(1)
        }}
        selectFilters={selectFilters}
        isLoading={isLoading}
        loadingText="Loading knowledge documents..."
        emptyMessage="No knowledge documents found matching your filter criteria."
        pagination={paginationMeta}
        onPageChange={(p) => setPage(p)}
      />

      {/* Create Modal */}
      <CreateKnowledgeDocModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchDocuments()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Knowledge Document?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? It will also be removed from the vector database index.`}
        confirmText="Delete Document"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
