import { IFraudEventRepository } from "../../domain/repositories/fraud-event.repository.interface"
import {
  IGetUserFraudProfileUseCase,
  UserFraudProfileResult,
} from "../interfaces/fraud-usecases.interface"

export class GetUserFraudProfileUseCase implements IGetUserFraudProfileUseCase {
  constructor(private readonly repository: IFraudEventRepository) {}

  async execute(userId: string): Promise<UserFraudProfileResult> {
    const [summary, recentEvents] = await Promise.all([
      this.repository.getUserFraudSummary(userId),
      this.repository.findByUserId(userId, 10),
    ])

    return {
      summary,
      recentEvents,
    }
  }
}
