import { useEffect, useState, useMemo } from "react"
import { FolderTree, Table, Plus } from "lucide-react"
import type {
  VehicleCategory,
  VehicleClass,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateClassInput,
  UpdateClassInput,
} from "../types"
import { useVehicleCatelogStore } from "../store/catelog.store"

import CategoryCard from "../components/ui/CategoryCard"
import ClassCard from "../components/ui/ClassCard"
import AddClassPlaceholderCard from "../components/ui/AddClassPlaceholderCard"
import CategoryModal from "../components/modals/CategoryModal"
import ClassModal from "../components/modals/ClassModal"

import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { DataTable, DataTableToolbar, type PaginationMeta } from "@/shared/components/data-table"
import { getClassColumns } from "../table/columns"
import Loading from "@/shared/components/ui/Loading"

export default function VehicleCatelog() {
  const {
    categories,
    classes,
    isLoading,
    viewMode,
    expandedCategories,
    searchQuery,
    loadData,
    setViewMode,
    toggleCategoryExpand,
    setSearchQuery,
    toggleCategoryStatus,
    toggleClassStatus,
    deleteCategory,
    deleteClass,
    saveCategory,
    saveClass,
  } = useVehicleCatelogStore()

  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [page, setPage] = useState(1)
  const limit = 10

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<VehicleCategory | null>(null)

  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<VehicleClass | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>(undefined)

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: "category" | "class"
    id: string
    name: string
    isActive: boolean
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddCategoryClick = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleEditCategoryClick = (cat: VehicleCategory, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCategory(cat)
    setIsCategoryModalOpen(true)
  }

  const handleDeleteCategoryClick = (cat: VehicleCategory, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmTarget({
      type: "category",
      id: cat.id,
      name: cat.name,
      isActive: cat.isActive,
    })
  }

  const handleSaveCategory = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    await saveCategory(editingCategory?.id ?? null, data)
    setIsCategoryModalOpen(false)
  }

  const handleAddClassClick = (categoryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingClass(null)
    setDefaultCategoryId(categoryId)
    setIsClassModalOpen(true)
  }

  const handleEditClassClick = (cls: VehicleClass, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingClass(cls)
    setDefaultCategoryId(cls.categoryId)
    setIsClassModalOpen(true)
  }

  const handleDeleteClassClick = (cls: VehicleClass, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmTarget({
      type: "class",
      id: cls.id,
      name: cls.name,
      isActive: cls.isActive,
    })
  }

  const handleSaveClass = async (data: CreateClassInput | UpdateClassInput) => {
    await saveClass(editingClass?.id ?? null, data)
    setIsClassModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return
    const { type, id } = deleteConfirmTarget

    try {
      if (type === "category") {
        await deleteCategory(id)
      } else {
        await deleteClass(id)
      }
      setDeleteConfirmTarget(null)
    } catch {
      // Error is already notified by store action toast; ignore here
    }
  }

  const handleToggleCategoryStatusClick = async (cat: VehicleCategory, e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleCategoryStatus(cat.id, cat.isActive)
  }

  const handleToggleClassStatusClick = async (cls: VehicleClass, e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleClassStatus(cls.id, cls.isActive)
  }

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const parentCat = categories.find((c) => c.id === cls.categoryId)
      const categoryName = parentCat ? parentCat.name : ""

      if (selectedCategoryId !== "ALL" && cls.categoryId !== selectedCategoryId) {
        return false
      }

      if (selectedStatus === "ACTIVE" && !cls.isActive) return false
      if (selectedStatus === "INACTIVE" && cls.isActive) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          cls.name.toLowerCase().includes(query) ||
          cls.slug.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [classes, categories, selectedCategoryId, selectedStatus, searchQuery])

  const categoryTabs = useMemo(
    () => [
      { id: "ALL", label: "All Classes" },
      ...categories.map((c) => ({ id: c.id, label: c.name })),
    ],
    [categories]
  )

  const selectFilters = useMemo(
    () => [
      {
        id: "categoryFilter",
        label: "Filter by Category",
        value: selectedCategoryId,
        onChange: (val: string) => {
          setSelectedCategoryId(val)
          setPage(1)
        },
        options: [
          { label: "All Categories", value: "ALL" },
          ...categories.map((c) => ({ label: c.name, value: c.id })),
        ],
      },
      {
        id: "statusFilter",
        label: "Filter by Status",
        value: selectedStatus,
        onChange: (val: string) => {
          setSelectedStatus(val)
          setPage(1)
        },
        options: [
          { label: "All Status", value: "ALL" },
          { label: "Active Only", value: "ACTIVE" },
          { label: "Inactive Only", value: "INACTIVE" },
        ],
      },
    ],
    [selectedCategoryId, selectedStatus, categories]
  )

  const total = filteredClasses.length
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const paginatedClasses = useMemo(() => {
    const start = (page - 1) * limit
    return filteredClasses.slice(start, start + limit)
  }, [filteredClasses, page, limit])

  const paginationMeta: PaginationMeta = useMemo(
    () => ({
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }),
    [total, page, limit, totalPages]
  )

  const formattedCategoryCount = String(categories.length).padStart(2, "0")
  const formattedClassCount = String(classes.length).padStart(2, "0")

  const columns = getClassColumns({
    categories,
    onToggleStatus: handleToggleClassStatusClick,
    onEdit: handleEditClassClick,
    onDelete: handleDeleteClassClick,
  })

  return (
    <div className="space-y-6 text-left text-slate-100 select-none animate-in fade-in duration-300">
      <Breadcrumbs
        items={[{ label: "Admin", path: "/admin/dashboard" }, { label: "Catelog Management" }]}
      />

      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-800 pb-6">
        <div className="max-w-2xl text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#DCE1FB] via-slate-100 to-slate-400 leading-tight tracking-tight mb-2">
            Vehicle Classification
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-normal leading-relaxed">
            Manage the structural taxonomy for all vehicles processed through the Sentinel Auto
            pipeline. Define categories, sub-classes, and processing rules.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start md:self-end">
          <div className="flex p-1 bg-[#191F31] rounded-xl border border-slate-800/80">
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === "tree"
                  ? "bg-[#ADC6FF] text-[#002E6A] shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FolderTree size={14} />
              <span>Tree View</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#ADC6FF] text-[#002E6A] shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Table size={14} />
              <span>Table View</span>
            </button>
          </div>

          <button
            onClick={handleAddCategoryClick}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ADC6FF] text-[#002E6A] hover:bg-[#b8cffd] text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex justify-between items-center p-6 rounded-3xl border border-slate-800 bg-[#151B2D] shadow-md transition-all hover:border-slate-700/50">
          <div className="text-left space-y-1.5">
            <span className="text-xs text-[#ADC6FF] font-bold uppercase tracking-wider">
              Total Categories
            </span>
            <h2 className="text-4xl font-extrabold text-[#DCE1FB] tracking-tight">
              {formattedCategoryCount}
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
            Global Standard
          </span>
        </div>

        <div className="flex justify-between items-center p-6 rounded-3xl border border-slate-800 bg-[#151B2D] shadow-md transition-all hover:border-slate-700/50">
          <div className="text-left space-y-1.5">
            <span className="text-xs text-[#ADC6FF] font-bold uppercase tracking-wider">
              Total Classes
            </span>
            <h2 className="text-4xl font-extrabold text-[#DCE1FB] tracking-tight">
              {formattedClassCount}
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
            Unique Types
          </span>
        </div>
      </div>

      {isLoading ? (
        <Loading
          size="lg"
          text="Loading vehicle classification data..."
          className="py-20 gap-3 text-slate-400"
        />
      ) : viewMode === "tree" ? (
        <div className="flex flex-col gap-6">
          {categories.map((cat) => {
            const catClasses = classes.filter((cls) => cls.categoryId === cat.id)
            const isExpanded = !!expandedCategories[cat.id]

            return (
              <div key={cat.id} className="flex flex-col gap-2">
                <CategoryCard
                  category={cat}
                  catClassesCount={catClasses.length}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleCategoryExpand(cat.id)}
                  onEdit={handleEditCategoryClick}
                  onDelete={handleDeleteCategoryClick}
                  onToggleStatus={handleToggleCategoryStatusClick}
                />

                {isExpanded && (
                  <div className="flex flex-col pl-16 relative mt-1 gap-4">
                    <div className="flex flex-col gap-4">
                      {catClasses.map((cls, index) => (
                        <ClassCard
                          key={cls.id}
                          cls={cls}
                          index={index}
                          onEdit={handleEditClassClick}
                          onDelete={handleDeleteClassClick}
                          onToggleStatus={handleToggleClassStatusClick}
                        />
                      ))}

                      <AddClassPlaceholderCard
                        categoryId={cat.id}
                        classesCount={catClasses.length}
                        onAddClass={handleAddClassClick}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            tabs={categoryTabs}
            activeTab={selectedCategoryId}
            onTabChange={(tabId) => {
              setSelectedCategoryId(tabId)
              setPage(1)
            }}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q)
              setPage(1)
            }}
            searchPlaceholder="Search classes, codes, or categories..."
            selectFilters={selectFilters}
          />
          <DataTable
            columns={columns}
            data={paginatedClasses}
            rowKey={(row) => row.id}
            emptyMessage="No matching sub-classes found. Try adjusting your search or filters."
            pagination={paginationMeta}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        categories={categories}
        vehicleClass={editingClass}
        defaultCategoryId={defaultCategoryId}
      />

      <ConfirmationModal
        isOpen={!!deleteConfirmTarget}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete Vehicle ${
          deleteConfirmTarget?.type === "category" ? "Category" : "Sub-Class"
        }`}
        message={`Are you sure you want to permanently delete "${
          deleteConfirmTarget?.name
        }"? This will permanently delete it unless it is being used by any vehicle class, category or station. ${
          deleteConfirmTarget?.type === "category"
            ? "Note that permanently deleting this category will also delete all sub-classes configured inside it."
            : ""
        }`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  )
}
