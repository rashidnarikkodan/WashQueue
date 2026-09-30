import { IFraudEventRepository } from "../../domain/repositories/fraud-event.repository.interface";
import { FraudEvent } from "../../domain/entities/fraud-event.entity";
import { NotFoundError } from "@/common/errors/not-found-error";
import { BadRequestError } from "@/common/errors/bad-request-error";
import { UpdateFraudEventStatusInputDTO } from "../dtos/fraud.dto";
import { IUpdateFraudEventStatusUseCase } from "../interfaces/fraud-usecases.interface";

export class UpdateFraudEventStatusUseCase implements IUpdateFraudEventStatusUseCase {
  constructor(private readonly repository: IFraudEventRepository) {}

  async execute(dto: UpdateFraudEventStatusInputDTO): Promise<FraudEvent> {
    const event = await this.repository.findById(dto.eventId);
    if (!event) {
      throw new NotFoundError(`Fraud event not found: ${dto.eventId}`);
    }

    switch (dto.action) {
      case "REVIEW":
        event.startReview(dto.adminId);
        break;
      case "RESOLVE":
        event.resolve(dto.adminId, dto.notes || "Resolved by administrator");
        break;
      case "DISMISS":
        event.dismiss(dto.adminId, dto.notes || "Dismissed by administrator");
        break;
      default:
        throw new BadRequestError(`Invalid action: ${dto.action}`);
    }

    return await this.repository.save(event);
  }
}
