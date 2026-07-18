export interface VehicleCategory {
  id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  classes?: VehicleClass[]
}

export interface CreateCategoryInput {
  name: string
  slug?: string
  description?: string
  order?: number
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  description?: string
  order?: number
  isActive?: boolean
}

export interface VehicleClass {
  id: string
  categoryId: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
}

export interface CreateClassInput {
  categoryId: string
  name: string
  slug?: string
  description?: string
  order?: number
}

export interface UpdateClassInput {
  categoryId?: string
  name?: string
  slug?: string
  description?: string
  order?: number
  isActive?: boolean
}
