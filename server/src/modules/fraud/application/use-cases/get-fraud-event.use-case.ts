import { IFraudEventRepository } from "../../domain/repositories/fraud-event.repository.interface"
import { FraudEvent } from "../../domain/entities/fraud-event.entity"
import { NotFoundError } from "@/common/errors/not-found-error"
import { IGetFraudEventUseCase } from "../interfaces/fraud-usecases.interface"

export class GetFraudEventUseCase implements IGetFraudEventUseCase {
  constructor(private readonly repository: IFraudEventRepository) {}

  async execute(id: string): Promise<FraudEvent> {
    const event = await this.repository.findById(id)
    if (!event) {
      throw new NotFoundError(`Fraud event not found: ${id}`)
    }
    return event
  }
}
