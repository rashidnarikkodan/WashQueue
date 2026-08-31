import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { Settlement } from "../../domain/entities/Settlement"
import SettlementModel, { ISettlementDocument } from "../models/settlement.model"
import { SettlementMapper } from "../mappers/settlement.mapper"

export class SettlementRepository
  extends BaseRepository<Settlement, ISettlementDocument>
  implements ISettlementRepository
{
  constructor() {
    super(SettlementModel, new SettlementMapper())
  }

  async findByBookingId(bookingId: string): Promise<Settlement | null> {
    const doc = await this.model.findOne({ bookingId }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }
}
