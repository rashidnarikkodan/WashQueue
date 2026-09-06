export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ErrorResponseLike {
  response?: {
    data?: {
      message?: string
    }
    status?: number
  }
  message?: string
  config?: {
    _retry?: boolean
    url?: string
    skipToast?: boolean
  }
}
