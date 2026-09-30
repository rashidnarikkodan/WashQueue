import { IFraudEventRepository } from "../../domain/repositories/fraud-event.repository.interface"
import { FraudEvent } from "../../domain/entities/fraud-event.entity"
import { FraudEventFilterDTO } from "../dtos/fraud.dto"
import { IListFraudEventsUseCase } from "../interfaces/fraud-usecases.interface"

export class ListFraudEventsUseCase implements IListFraudEventsUseCase {
  constructor(private readonly repository: IFraudEventRepository) {}

  async execute(filters: FraudEventFilterDTO): Promise<{ items: FraudEvent[]; total: number }> {
    return await this.repository.findWithFilters(filters)
  }
}
