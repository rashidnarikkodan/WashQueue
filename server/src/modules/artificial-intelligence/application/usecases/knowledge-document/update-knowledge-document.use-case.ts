import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import { KnowledgeDocumentProps } from "../../../domain/entities/KnowledgeDocument.entity"
import { UpdateKnowledgeDocumentDto } from "../../dto/knowledge-document.dto"
import { NotFoundError } from "@/common/errors/not-found-error"
import {
  IUpdateKnowledgeDocumentUseCase,
  IIndexKnowledgeDocumentUseCase,
} from "../../interfaces/knowledge-document-usecases.interface"

export class UpdateKnowledgeDocumentUseCase implements IUpdateKnowledgeDocumentUseCase {
  constructor(
    private readonly repository: IKnowledgeDocumentRepository,
    private readonly indexUseCase: IIndexKnowledgeDocumentUseCase
  ) {}

  async execute(id: string, updates: UpdateKnowledgeDocumentDto): Promise<KnowledgeDocumentProps> {
    const doc = await this.repository.findById(id)
    if (!doc) {
      throw new NotFoundError("Knowledge Document not found")
    }

    if (updates.title && updates.content) {
      doc.updateContent(updates.title, updates.content)
    } else if (updates.title) {
      doc.updateContent(updates.title, doc.content)
    } else if (updates.content) {
      doc.updateContent(doc.title, updates.content)
    }

    if (updates.category) {
      doc.changeCategory(updates.category)
    }
    if (updates.locale) {
      doc.changeLocale(updates.locale)
    }
    const prevStatus = doc.status
    if (updates.status) {
      if (updates.status === "PUBLISHED") {
        doc.publish()
      } else if (updates.status === "ARCHIVED") {
        doc.archive()
      } else if (updates.status === "DRAFT") {
        doc.unpublish()
      }
    }

    const updatedDoc = await this.repository.update(id, doc)

    // Trigger background indexing if status changed or content/title/category/locale changed
    const statusChanged = updates.status && updates.status !== prevStatus
    const contentChanged = Boolean(
      updates.title || updates.content || updates.category || updates.locale
    )

    if (statusChanged || contentChanged) {
      this.indexUseCase.execute(id).catch((err) => {
        console.error("Failed to index knowledge document on update:", err)
      })
    }

    return updatedDoc!.toJSON()
  }
}
