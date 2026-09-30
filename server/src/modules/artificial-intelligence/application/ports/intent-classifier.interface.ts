import { IntentResult } from "../../domain/types/ai-intent"

export interface IIntentClassifier {
  classify(message: string): Promise<IntentResult>
}
