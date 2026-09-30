import {
  IFraudEventRepository,
  FraudDashboardMetrics,
} from "../../domain/repositories/fraud-event.repository.interface";
import { IGetFraudMetricsUseCase } from "../interfaces/fraud-usecases.interface";

export class GetFraudMetricsUseCase implements IGetFraudMetricsUseCase {
  constructor(private readonly repository: IFraudEventRepository) {}

  async execute(startDate?: Date, endDate?: Date): Promise<FraudDashboardMetrics> {
    return await this.repository.getDashboardMetrics(startDate, endDate);
  }
}
