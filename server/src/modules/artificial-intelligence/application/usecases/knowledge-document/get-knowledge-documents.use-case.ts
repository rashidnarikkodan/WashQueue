import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import {
  GetKnowledgeDocumentsQuery,
  GetKnowledgeDocumentsResponse,
} from "../../dto/knowledge-document.dto"
import { IGetKnowledgeDocumentsUseCase } from "../../interfaces/knowledge-document/knowledge-document-usecases.interface"

export class GetKnowledgeDocumentsUseCase implements IGetKnowledgeDocumentsUseCase {
  constructor(private readonly repository: IKnowledgeDocumentRepository) {}

  async execute(query: GetKnowledgeDocumentsQuery): Promise<GetKnowledgeDocumentsResponse> {
    const result = await this.repository.findAll(query as Record<string, unknown>)
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: result.data.map((d: any) => d.toJSON()),
      total: result.total,
    }
  }
}
