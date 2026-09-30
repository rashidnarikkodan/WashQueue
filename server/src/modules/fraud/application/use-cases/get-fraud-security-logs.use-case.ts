import {
  IFraudEventRepository,
  SecurityLogItem,
} from "../../domain/repositories/fraud-event.repository.interface";
import { IGetFraudSecurityLogsUseCase } from "../interfaces/fraud-usecases.interface";

export class GetFraudSecurityLogsUseCase implements IGetFraudSecurityLogsUseCase {
  constructor(private readonly repository: IFraudEventRepository) {}

  async execute(): Promise<SecurityLogItem[]> {
    return await this.repository.getSecurityLogs();
  }
}
