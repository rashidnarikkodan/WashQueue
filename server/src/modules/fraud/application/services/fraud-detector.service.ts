import { IFraudDetectorService } from "../../domain/services/fraud-detector.interface";
import { IFraudRule, FraudEvaluationContext } from "../../domain/services/fraud-rule.interface";
import { RiskAssessment, RiskLevel, FraudSignal } from "../../domain/value-objects/fraud-types.vo";

export class FraudDetectorService implements IFraudDetectorService {
  constructor(private readonly rules: IFraudRule[]) {}

  async assess(context: FraudEvaluationContext): Promise<RiskAssessment> {
    const applicableRules = this.rules.filter((rule) => rule.isApplicable(context));

    const signalPromises = applicableRules.map(async (rule) => {
      try {
        return await rule.evaluate(context);
      } catch {
        return null;
      }
    });

    const evaluated = await Promise.all(signalPromises);
    const activeSignals = evaluated.filter((sig): sig is FraudSignal => sig !== null);

    const rawScore = activeSignals.reduce((acc, sig) => acc + sig.score, 0);
    const score = Math.min(100, Math.max(0, rawScore));

    let level = RiskLevel.LOW;
    if (score >= 70) {
      level = RiskLevel.HIGH;
    } else if (score >= 40) {
      level = RiskLevel.MEDIUM;
    }

    const reason =
      activeSignals.length > 0
        ? activeSignals.map((s) => s.description).join("; ")
        : "Standard activity";

    return {
      score,
      level,
      signals: activeSignals,
      reason,
    };
  }
}
