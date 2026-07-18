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

export interface ClassResponseDto {
  id: string
  categoryId: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
}
