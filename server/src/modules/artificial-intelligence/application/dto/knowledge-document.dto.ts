import {
  KnowledgeDocumentCategory,
  KnowledgeDocumentStatus,
  KnowledgeDocumentProps,
} from "../../domain/entities/KnowledgeDocument.entity"

export interface CreateKnowledgeDocumentDto {
  title: string
  content: string
  category: KnowledgeDocumentCategory
  status: KnowledgeDocumentStatus
  locale: string
}

export interface UpdateKnowledgeDocumentDto {
  title?: string
  content?: string
  category?: KnowledgeDocumentCategory
  status?: KnowledgeDocumentStatus
  locale?: string
}

export interface GetKnowledgeDocumentsQuery {
  page?: string
  limit?: string
  category?: KnowledgeDocumentCategory
  status?: KnowledgeDocumentStatus
}

export interface GetKnowledgeDocumentsResponse {
  data: KnowledgeDocumentProps[]
  total: number
}

export interface SearchKnowledgeDocumentDto {
  query: string
  limit?: number
  minScore?: number
  filter?: {
    documentId?: string
    category?: string
    locale?: string
  }
}
