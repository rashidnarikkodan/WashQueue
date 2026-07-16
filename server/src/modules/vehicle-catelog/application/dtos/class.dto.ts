export interface CreateClassInput {
  categoryId: string
  name: string
  slug?: string
  order?: number
}

export interface UpdateClassInput {
  categoryId?: string
  name?: string
  slug?: string
  order?: number
}

export interface ClassResponseDto {
  id: string
  categoryId: string
  name: string
  slug: string
  order: number
}
