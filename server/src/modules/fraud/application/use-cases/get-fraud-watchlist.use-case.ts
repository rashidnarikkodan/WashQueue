import {
  IFraudEventRepository,
  WatchlistUserItem,
} from "../../domain/repositories/fraud-event.repository.interface";
import { IGetFraudWatchlistUseCase } from "../interfaces/fraud-usecases.interface";

export class GetFraudWatchlistUseCase implements IGetFraudWatchlistUseCase {
  constructor(private readonly repository: IFraudEventRepository) {}

  async execute(): Promise<WatchlistUserItem[]> {
    return await this.repository.getWatchlist();
  }
}
