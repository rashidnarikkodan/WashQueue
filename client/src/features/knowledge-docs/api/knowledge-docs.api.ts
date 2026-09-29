import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type { ApiResponse } from "@/shared/types/ApiResponse"
import type {
  KnowledgeDocument,
  GetKnowledgeDocumentsParams,
  GetKnowledgeDocumentsResponse,
  CreateKnowledgeDocumentPayload,
  UpdateKnowledgeDocumentPayload,
} from "../types/knowledge-docs.types"

export const knowledgeDocsApi = {
  getAll: async (params?: GetKnowledgeDocumentsParams): Promise<GetKnowledgeDocumentsResponse> => {
    try {
      const response = await api.get<ApiResponse<GetKnowledgeDocumentsResponse>>(
        API_ROUTES.AI.KNOWLEDGE_DOCS,
        { params }
      )
      return response.data.data
    } catch (error) {
      handleApiError(error, "Failed to fetch knowledge documents")
      return { data: [], total: 0 }
    }
  },

  getById: async (id: string): Promise<KnowledgeDocument | null> => {
    try {
      const response = await api.get<ApiResponse<KnowledgeDocument>>(
        API_ROUTES.AI.KNOWLEDGE_DOC_BY_ID(id)
      )
      return response.data.data
    } catch (error) {
      handleApiError(error, "Failed to fetch knowledge document details")
      return null
    }
  },

  create: async (payload: CreateKnowledgeDocumentPayload): Promise<KnowledgeDocument> => {
    try {
      const response = await api.post<ApiResponse<KnowledgeDocument>>(
        API_ROUTES.AI.KNOWLEDGE_DOCS,
        payload
      )
      return response.data.data
    } catch (error) {
      handleApiError(error, "Failed to create knowledge document")
      throw error
    }
  },

  update: async (
    id: string,
    payload: UpdateKnowledgeDocumentPayload
  ): Promise<KnowledgeDocument> => {
    try {
      const response = await api.put<ApiResponse<KnowledgeDocument>>(
        API_ROUTES.AI.KNOWLEDGE_DOC_BY_ID(id),
        payload
      )
      return response.data.data
    } catch (error) {
      handleApiError(error, "Failed to update knowledge document")
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ROUTES.AI.KNOWLEDGE_DOC_BY_ID(id))
    } catch (error) {
      handleApiError(error, "Failed to delete knowledge document")
      throw error
    }
  },
}
