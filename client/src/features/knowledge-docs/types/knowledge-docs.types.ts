export type KnowledgeDocumentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type KnowledgeDocumentCategory =
  "FAQ" | "POLICY" | "SERVICE" | "BOOKING" | "PAYMENT" | "QUEUE" | "SUPPORT"

export interface KnowledgeDocument {
  id: string
  title: string
  content: string
  category: KnowledgeDocumentCategory
  status: KnowledgeDocumentStatus
  locale: string
  version: number
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface GetKnowledgeDocumentsParams {
  page?: number
  limit?: number
  category?: string
  status?: string
  search?: string
}

export interface GetKnowledgeDocumentsResponse {
  data: KnowledgeDocument[]
  total: number
}

export interface CreateKnowledgeDocumentPayload {
  title: string
  content: string
  category: KnowledgeDocumentCategory
  status: KnowledgeDocumentStatus
  locale?: string
}

export interface UpdateKnowledgeDocumentPayload {
  title?: string
  content?: string
  category?: KnowledgeDocumentCategory
  status?: KnowledgeDocumentStatus
  locale?: string
}
