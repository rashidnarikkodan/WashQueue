import logger from "@/configs/logger.config"
import { IIntentClassifier } from "../../application/ports/intent-classifier.interface"
import { ILLMProvider } from "../../application/ports/ai-provider.interface"
import { AIIntent, IntentResult } from "../../domain/types/ai-intent"

interface IntentLLMOutput {
  intent?: string
  confidence?: number
}

export class OllamaIntentClassifier implements IIntentClassifier {
  constructor(private readonly llm: ILLMProvider) {}

  async classify(message: string): Promise<IntentResult> {
    if (!message || !message.trim()) {
      return {
        intent: AIIntent.OUT_OF_SCOPE,
        confidence: 0,
      }
    }

    const systemPrompt = `You are an intent classification engine for WashQueue's AI assistant (Qyn).
WashQueue is a specialized platform for car wash station discovery, live queue monitoring, and booking time slots.

You must classify the user's message into EXACTLY ONE of the following intents:
- FAQ: Questions about how WashQueue works, platform guidelines, account features, how to book, the booking flow/process, or general help. (NOTE: Asking "how do I book" or "what is the booking flow" is FAQ, NOT BOOKING_INFO).
- SERVICE_INFO: Questions about types of car washes (e.g. express wash, full wash, detailing, foam wash, interior cleaning).
- POLICY: Inquiries about cancellation policy, refund terms, rescheduling limits, and operational rules.
- BOOKING_INFO: Inquiries specifically about an existing personal booking (e.g. "what is my booking status", "where is my car", looking up a booking reference like WQ-..., or viewing personal past bookings).
- PAYMENT_INFO: Questions about payment methods, pricing, wallet balance, receipts, or refund status.
- QUEUE_INFO: Live queue inquiries, current queue length, wait times, bay status, or queue depth at a station.
- STATION_DISCOVERY: Inquiries to find, locate, search, or list car wash stations near a place, by address, or by name.
- RECOMMENDATION: Seeking advice on which station or service package to choose based on queue length, rating, or preferences.
- SUPPORT_INFO: Inquiries regarding customer support contact, filing a complaint, reporting an issue, or contacting help.
- OUT_OF_SCOPE: Any message that is unrelated to WashQueue, car washing, stations, queues, bookings, or payments (e.g., jokes, coding, weather, math, general trivia, off-topic greetings).

Rules:
1. Return ONLY a valid JSON object matching this schema:
   {"intent": "<INTENT_NAME>", "confidence": <number between 0.0 and 1.0>}
2. Do not include markdown commentary, explanations, or any text other than the JSON object.
3. If the user message is off-topic (e.g. telling jokes, asking general knowledge), you MUST classify it as OUT_OF_SCOPE.

Classification Examples:
- "How can I do booking, what is the flow?" -> {"intent": "FAQ", "confidence": 0.95}
- "How do I book a wash?" -> {"intent": "FAQ", "confidence": 0.95}
- "Show my bookings" -> {"intent": "BOOKING_INFO", "confidence": 0.95}
- "Status of booking WQ-2026-1234" -> {"intent": "BOOKING_INFO", "confidence": 0.98}
- "Find stations near Kochi" -> {"intent": "STATION_DISCOVERY", "confidence": 0.95}
- "How long is the queue at Station 1?" -> {"intent": "QUEUE_INFO", "confidence": 0.95}
- "What is your refund policy?" -> {"intent": "POLICY", "confidence": 0.95}`

    const prompt = `User message: "${message.trim()}"`

    try {
      const response = await this.llm.generateStructured<IntentLLMOutput>({
        systemPrompt,
        prompt,
        temperature: 0.1,
        format: "json",
      })
      console.log(response)

      const rawIntent = (response?.intent || "").trim().toUpperCase()
      const allowedIntents = Object.values(AIIntent) as string[]

      if (!allowedIntents.includes(rawIntent)) {
        logger.warn(
          { rawIntent },
          "[OllamaIntentClassifier] Model returned unrecognized intent, defaulting to OUT_OF_SCOPE"
        )
        return {
          intent: AIIntent.OUT_OF_SCOPE,
          confidence: 0,
        }
      }

      const validIntent = rawIntent as AIIntent
      let confidence = typeof response.confidence === "number" ? response.confidence : 0.8
      if (Number.isNaN(confidence) || confidence < 0) {
        confidence = 0
      } else if (confidence > 1) {
        confidence = 1
      }

      return {
        intent: validIntent,
        confidence,
      }
    } catch (error) {
      logger.error(
        { error, message },
        "[OllamaIntentClassifier] LLM intent classification call failed (connection error, timeout, or model missing). Defaulting to OUT_OF_SCOPE with confidence 0."
      )
      return {
        intent: AIIntent.OUT_OF_SCOPE,
        confidence: 0,
      }
    }
  }
}
