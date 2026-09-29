import { useEffect, useState, useMemo } from "react"
import { FolderTree, Table, Plus, Layers, CheckCircle2, Car } from "lucide-react"
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
import { StatsHUD, type StatItem } from "@/shared/components/stats"
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

  const statItems: StatItem[] = useMemo(() => {
    const activeCategoriesCount = categories.filter((c) => c.isActive).length
    const activeClassesCount = classes.filter((c) => c.isActive).length

    return [
      {
        id: "total-categories",
        label: "Total Categories",
        value: categories.length,
        icon: FolderTree,
        variant: "primary",
        description: "Classification groupings",
      },
      {
        id: "active-categories",
        label: "Active Categories",
        value: activeCategoriesCount,
        icon: CheckCircle2,
        variant: "emerald",
        description: "Available in service catalogs",
      },
      {
        id: "total-classes",
        label: "Total Sub-Classes",
        value: classes.length,
        icon: Layers,
        variant: "blue",
        description: "Specific vehicle model tiers",
      },
      {
        id: "active-classes",
        label: "Active Sub-Classes",
        value: activeClassesCount,
        icon: Car,
        variant: "amber",
        description: "Active for customer booking",
      },
    ]
  }, [categories, classes])

  const columns = getClassColumns({
    categories,
    onToggleStatus: handleToggleClassStatusClick,
    onEdit: handleEditClassClick,
    onDelete: handleDeleteClassClick,
  })

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-2 pb-16 space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      <Breadcrumbs
        items={[{ label: "Admin", path: "/admin/dashboard" }, { label: "Vehicle Categories" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Vehicle Categories
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Manage categories, vehicle classes, and service tiers for car wash pricing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex p-1 bg-card rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === "tree"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderTree size={14} />
              <span>Tree View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table size={14} />
              <span>Table View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddCategoryClick}
            className="flex items-center gap-2 font-semibold px-4.5 py-2.5 rounded-xl transition-all shadow-md select-none bg-primary hover:opacity-90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <StatsHUD stats={statItems} columns={4} />

      {isLoading ? (
        <Loading
          size="lg"
          text="Loading vehicle classification data..."
          className="py-20 gap-3 text-muted-foreground"
        />
      ) : viewMode === "tree" ? (
        categories.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-border bg-card/50 text-muted-foreground">
            <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-40 text-muted-foreground" />
            <p className="font-semibold text-foreground">No vehicle categories found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Get started by adding your first vehicle category above.
            </p>
          </div>
        ) : (
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
        )
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
