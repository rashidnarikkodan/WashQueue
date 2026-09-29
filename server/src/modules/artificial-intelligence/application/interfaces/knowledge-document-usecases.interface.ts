import {
  CreateKnowledgeDocumentDto,
  UpdateKnowledgeDocumentDto,
  GetKnowledgeDocumentsQuery,
  GetKnowledgeDocumentsResponse,
  SearchKnowledgeDocumentDto,
} from "../dto/knowledge-document.dto"
import { KnowledgeDocumentProps } from "../../domain/entities/KnowledgeDocument.entity"
import { RetrievedChunk } from "../ports/vector.interface"

export interface ICreateKnowledgeDocumentUseCase {
  execute(data: CreateKnowledgeDocumentDto): Promise<KnowledgeDocumentProps>
}

export interface IGetKnowledgeDocumentsUseCase {
  execute(query: GetKnowledgeDocumentsQuery): Promise<GetKnowledgeDocumentsResponse>
}

export interface IGetKnowledgeDocumentUseCase {
  execute(id: string): Promise<KnowledgeDocumentProps>
}

export interface IUpdateKnowledgeDocumentUseCase {
  execute(id: string, data: UpdateKnowledgeDocumentDto): Promise<KnowledgeDocumentProps>
}

export interface IDeleteKnowledgeDocumentUseCase {
  execute(id: string): Promise<void>
}
export interface IIndexKnowledgeDocumentUseCase {
  execute(documentId: string): Promise<void>
}
export interface ISearchKnowledgeDocumentUseCase {
  execute(data: SearchKnowledgeDocumentDto): Promise<RetrievedChunk[]>
}
