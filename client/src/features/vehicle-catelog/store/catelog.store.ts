import { create } from "zustand"
import { toast } from "sonner"
import type { VehicleCategory, VehicleClass, CreateCategoryInput, UpdateCategoryInput, CreateClassInput, UpdateClassInput } from "../types"
import { vehicleCatelogApi } from "@/shared/apis"

interface VehicleCatelogStore {
  categories: VehicleCategory[]
  classes: VehicleClass[]
  isLoading: boolean
  viewMode: "tree" | "table"
  expandedCategories: Record<string, boolean>
  searchQuery: string

  loadData: () => Promise<void>
  setViewMode: (mode: "tree" | "table") => void
  toggleCategoryExpand: (id: string) => void
  setSearchQuery: (query: string) => void
  toggleCategoryStatus: (id: string, currentStatus: boolean) => Promise<void>
  toggleClassStatus: (id: string, currentStatus: boolean) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  deleteClass: (id: string) => Promise<void>
  saveCategory: (editingCategoryId: string | null, data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>
  saveClass: (editingClassId: string | null, data: CreateClassInput | UpdateClassInput) => Promise<void>
}

export const useVehicleCatelogStore = create<VehicleCatelogStore>((set, get) => ({
  categories: [],
  classes: [],
  isLoading: true,
  viewMode: "tree",
  expandedCategories: {},
  searchQuery: "",

  loadData: async () => {
    set({ isLoading: true })
    try {
      const [catsData, classesData] = await Promise.all([
        vehicleCatelogApi.getCategories(),
        vehicleCatelogApi.getClasses(),
      ])

      const sortedCats = (catsData || []).sort((a, b) => a.order - b.order)
      const sortedClasses = (classesData || []).sort((a, b) => a.order - b.order)

      set({
        categories: sortedCats,
        classes: sortedClasses,
      })

      // Auto-expand first category if not set yet
      if (sortedCats.length > 0 && Object.keys(get().expandedCategories).length === 0) {
        set({
          expandedCategories: { [sortedCats[0].id]: true },
        })
      }
    } catch {
      toast.error("Failed to load vehicle catalog data")
    } finally {
      set({ isLoading: false })
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleCategoryExpand: (id) => {
    const prev = get().expandedCategories
    set({
      expandedCategories: {
        ...prev,
        [id]: !prev[id],
      },
    })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleCategoryStatus: async (id, currentStatus) => {
    try {
      await vehicleCatelogApi.updateCategory(id, { isActive: !currentStatus })
      await get().loadData()
    } catch {
      toast.error("Failed to update category status")
    }
  },

  toggleClassStatus: async (id, currentStatus) => {
    try {
      await vehicleCatelogApi.updateClass(id, { isActive: !currentStatus })
      await get().loadData()
    } catch {
      toast.error("Failed to update class status")
    }
  },

  deleteCategory: async (id) => {
    try {
      await vehicleCatelogApi.deleteCategory(id)
      await get().loadData()
    } catch {
      toast.error("Failed to delete category")
      throw new Error("Delete failed")
    }
  },

  deleteClass: async (id) => {
    try {
      await vehicleCatelogApi.deleteClass(id)
      await get().loadData()
    } catch {
      toast.error("Failed to delete class")
      throw new Error("Delete failed")
    }
  },

  saveCategory: async (editingCategoryId, data) => {
    if (editingCategoryId) {
      await vehicleCatelogApi.updateCategory(editingCategoryId, data as UpdateCategoryInput)
    } else {
      await vehicleCatelogApi.createCategory(data as CreateCategoryInput)
    }
    await get().loadData()
  },

  saveClass: async (editingClassId, data) => {
    if (editingClassId) {
      await vehicleCatelogApi.updateClass(editingClassId, data as UpdateClassInput)
    } else {
      await vehicleCatelogApi.createClass(data as CreateClassInput)
    }
    await get().loadData()
  },
}))
