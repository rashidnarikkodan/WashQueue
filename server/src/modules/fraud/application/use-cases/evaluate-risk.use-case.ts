import { IFraudDetectorService } from "../../domain/services/fraud-detector.interface";
import { IFraudEventRepository } from "../../domain/repositories/fraud-event.repository.interface";
import { FraudEvaluationContext } from "../../domain/services/fraud-rule.interface";
import { FraudEvent } from "../../domain/entities/fraud-event.entity";
import {
  RiskAssessment,
  RiskLevel,
  FraudEventStatus,
} from "../../domain/value-objects/fraud-types.vo";
import { EvaluateRiskInputDTO } from "../dtos/fraud.dto";
import { IEvaluateRiskUseCase } from "../interfaces/fraud-usecases.interface";

export class EvaluateRiskUseCase implements IEvaluateRiskUseCase {
  constructor(
    private readonly detector: IFraudDetectorService,
    private readonly repository: IFraudEventRepository
  ) {}

  async execute(dto: EvaluateRiskInputDTO): Promise<RiskAssessment> {
    const context: FraudEvaluationContext = {
      userId: dto.userId,
      actorType: dto.actorType,
      entityType: dto.entityType,
      entityId: dto.entityId,
      eventType: dto.eventType,
      stationId: dto.stationId,
      ipAddress: dto.ipAddress,
      deviceId: dto.deviceId,
      payload: dto.payload,
      timestamp: new Date(),
    };

    const assessment = await this.detector.assess(context);

    if (assessment.level === RiskLevel.MEDIUM || assessment.level === RiskLevel.HIGH) {
      const fraudEvent = new FraudEvent({
        userId: dto.userId,
        actorType: dto.actorType,
        entityType: dto.entityType,
        entityId: dto.entityId,
        eventType: dto.eventType,
        riskScore: assessment.score,
        riskLevel: assessment.level,
        signals: assessment.signals,
        reason: assessment.reason,
        status: FraudEventStatus.OPEN,
        metadata: {
          stationId: dto.stationId,
          ipAddress: dto.ipAddress,
          deviceId: dto.deviceId,
          ...dto.payload,
        },
      });

      await this.repository.save(fraudEvent);
    }

    return assessment;
  }
}
