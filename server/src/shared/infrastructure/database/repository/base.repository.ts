import { Model, Document } from "mongoose"
import { HasId, IBaseRepository, IMapper } from "@/shared/domain/repository/base.repository"

export abstract class BaseRepository<TDomain extends HasId, TPersist extends Document> implements IBaseRepository<TDomain> {
  constructor(
    protected readonly model: Model<TPersist>,
    protected readonly mapper: IMapper<TDomain, TPersist>
  ) {}

  async findById(id: string): Promise<TDomain | null> {
    const doc = await this.model.findById(id).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async save(entity: TDomain): Promise<TDomain> {
    const persistenceData = this.mapper.toPersistence(entity)
    const entityId = entity.id
    if (entityId && typeof entityId === "string" && entityId.trim() !== "") {
      const updatedDoc = await this.model.findByIdAndUpdate(
        entityId,
        { $set: persistenceData },
        { new: true }
      ).exec()
      if (updatedDoc) {
        return this.mapper.toDomain(updatedDoc)
      }
    }

    const newDoc = new this.model(persistenceData)
    const savedDoc = await newDoc.save()
    return this.mapper.toDomain(savedDoc)
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec()
  }

  async update(id: string, updates: Partial<TDomain>): Promise<TDomain | null> {
    const persistenceData = this.mapper.toPersistence(updates)
    const updatedDoc = await this.model.findByIdAndUpdate(
      id,
      { $set: persistenceData },
      { new: true }
    ).exec()
    return updatedDoc ? this.mapper.toDomain(updatedDoc) : null
  }
}