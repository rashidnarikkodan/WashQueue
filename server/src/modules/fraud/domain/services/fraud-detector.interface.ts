import { FraudEvaluationContext } from "./fraud-rule.interface"
import { RiskAssessment } from "../value-objects/fraud-types.vo"

export interface IFraudDetectorService {
  assess(context: FraudEvaluationContext): Promise<RiskAssessment>
}
