import { IKnowledgeDocumentRepository } from "../domain/repositories/knowledge-document.repository"
import KnowledgeDocument, {
  KnowledgeDocumentProps,
} from "../domain/entities/KnowledgeDocument.entity"
import { NotFoundError } from "@/common/errors/not-found-error"
import mongoose from "mongoose"

export class KnowledgeDocumentService {
  constructor(private readonly repository: IKnowledgeDocumentRepository) {}

  async create(
    data: Omit<KnowledgeDocumentProps, "id" | "version" | "createdAt" | "updatedAt">
  ): Promise<KnowledgeDocumentProps> {
    const doc = new KnowledgeDocument({
      ...data,
      id: new mongoose.Types.ObjectId().toString(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const savedDoc = await this.repository.save(doc)
    return savedDoc.toJSON()
  }

  async findAll(
    query: Record<string, unknown>
  ): Promise<{ data: KnowledgeDocumentProps[]; total: number }> {
    const result = await this.repository.findAll(query)
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: result.data.map((d: any) => d.toJSON()),
      total: result.total,
    }
  }

  async findById(id: string): Promise<KnowledgeDocumentProps> {
    const doc = await this.repository.findById(id)
    if (!doc) {
      throw new NotFoundError("Knowledge Document not found")
    }
    return doc.toJSON()
  }

  async update(
    id: string,
    updates: Partial<KnowledgeDocumentProps>
  ): Promise<KnowledgeDocumentProps> {
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
    if (updates.status === "PUBLISHED") {
      doc.publish()
    } else if (updates.status === "ARCHIVED") {
      doc.archive()
    } else if (updates.status === "DRAFT" && doc.status === "PUBLISHED") {
      doc.unpublish()
    }

    const updatedDoc = await this.repository.update(id, doc)
    return updatedDoc!.toJSON()
  }

  async delete(id: string): Promise<void> {
    const doc = await this.repository.findById(id)
    if (!doc) {
      throw new NotFoundError("Knowledge Document not found")
    }
    await this.repository.delete(id)
  }
}
