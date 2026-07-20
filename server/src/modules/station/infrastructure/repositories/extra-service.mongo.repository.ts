import { ClientSession, Types } from "mongoose"
import { ExtraService, ExtraServiceProps } from "../../domain/entities/ExtraService"
import { IExtraServiceRepository } from "../../domain/repositories/extra-service.repository"
import { ExtraServiceModel, IExtraService } from "../models/extra-service.model"
import { ExtraServiceMapper } from "../mappers/extra-service.mapper"

export class ExtraServiceMongoRepository implements IExtraServiceRepository {
  async findByStationId(stationId: string, session?: ClientSession): Promise<ExtraService[]> {
    const docs = await ExtraServiceModel.find({ stationId: new Types.ObjectId(stationId) })
      .session(session || null)
      .exec()
    return docs.map((doc) => ExtraServiceMapper.toDomain(doc))
  }

  async save(
    props: Omit<ExtraServiceProps, "id" | "createdAt" | "updatedAt">,
    session?: ClientSession
  ): Promise<ExtraService> {
    const persistenceData = {
      stationId: new Types.ObjectId(props.stationId),
      name: props.name,
      description: props.description,
      pricing: props.pricing.map((p) => ({
        vehicleClassId: new Types.ObjectId(p.vehicleClassId),
        price: p.price,
      })),
      isActive: props.isActive,
    }

    const doc = new ExtraServiceModel(persistenceData)
    if (session) {
      doc.$session(session)
    }
    const savedDoc = await doc.save()
    return ExtraServiceMapper.toDomain(savedDoc)
  }

  async update(
    id: string,
    data: Partial<Pick<ExtraServiceProps, "name" | "description" | "pricing" | "isActive">>,
    session?: ClientSession
  ): Promise<ExtraService | null> {
    const updateData: Partial<IExtraService> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.pricing !== undefined) {
      updateData.pricing = data.pricing.map((p) => ({
        vehicleClassId: new Types.ObjectId(p.vehicleClassId),
        price: p.price,
      }))
    }

    const updatedDoc = await ExtraServiceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, session }
    ).exec()

    return updatedDoc ? ExtraServiceMapper.toDomain(updatedDoc) : null
  }

  async delete(id: string, session?: ClientSession): Promise<void> {
    await ExtraServiceModel.findByIdAndDelete(id).session(session || null).exec()
  }

  async deleteByStationId(stationId: string, session?: ClientSession): Promise<void> {
    await ExtraServiceModel.deleteMany({ stationId: new Types.ObjectId(stationId) })
      .session(session || null)
      .exec()
  }
}
