import {
  KnowledgeDocumentProps,
  KnowledgeDocumentCategory,
  KnowledgeDocumentStatus,
} from "../../domain/entities/KnowledgeDocument.entity"

export interface KnowledgeDocumentResponseDTO {
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

export class KnowledgeDocumentDTOMapper {
  static toDTO(doc: KnowledgeDocumentProps): KnowledgeDocumentResponseDTO {
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      category: doc.category,
      status: doc.status,
      locale: doc.locale,
      version: doc.version,
      publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
      createdAt:
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
      updatedAt:
        doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
    }
  }

  static toListDTO(docs: KnowledgeDocumentProps[]): KnowledgeDocumentResponseDTO[] {
    return docs.map((d) => KnowledgeDocumentDTOMapper.toDTO(d))
  }
}
