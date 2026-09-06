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

export interface CategoryResponseDto {
  id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
}
