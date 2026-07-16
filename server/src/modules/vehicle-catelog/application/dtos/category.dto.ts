export interface CreateCategoryInput {
  name: string
  slug?: string
  order?: number
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  order?: number
}

export interface CategoryResponseDto {
  id: string
  name: string
  slug: string
  order: number
}
