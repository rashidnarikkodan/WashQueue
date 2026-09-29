import { IMapper } from "@/core/domain/repository.interface"
import KnowledgeDocument, {
  KnowledgeDocumentCategory,
  KnowledgeDocumentStatus,
} from "../../domain/entities/KnowledgeDocument.entity"
import { IKnowledgeDocument } from "../model/knowledge-document.model"

export class KnowledgeDocumentMapper implements IMapper<KnowledgeDocument, IKnowledgeDocument> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toDomain(raw: any): KnowledgeDocument {
    return new KnowledgeDocument({
      id: raw._id.toString(),
      title: raw.title,
      content: raw.content,
      category: raw.category as KnowledgeDocumentCategory,
      status: raw.status as KnowledgeDocumentStatus,
      locale: raw.locale,
      version: raw.version,
      chunkCount: raw.chunkCount ?? 0,
      publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toPersistence(entity: Partial<KnowledgeDocument>): any {
    const json = (entity as KnowledgeDocument).toJSON()
    return {
      ...(json.id && { _id: json.id }),
      title: json.title,
      content: json.content,
      category: json.category,
      status: json.status,
      locale: json.locale,
      version: json.version,
      chunkCount: json.chunkCount ?? 0,
      publishedAt: json.publishedAt ? new Date(json.publishedAt) : null,
    }
  }
}
