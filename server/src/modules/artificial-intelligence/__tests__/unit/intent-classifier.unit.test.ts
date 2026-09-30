import { describe, it, expect, vi } from "vitest"
import { OllamaIntentClassifier } from "../../infrastructure/intent/ollama.intent-classifier"
import { ILLMProvider } from "../../application/ports/ai-provider.interface"
import { AIIntent } from "../../domain/types/ai-intent"

describe("OllamaIntentClassifier (Unit Tests)", () => {
  const createMockLLM = (structuredResponse: unknown, shouldThrow = false): ILLMProvider => ({
    generate: vi.fn(),
    generateStructured: shouldThrow
      ? vi.fn().mockRejectedValue(new Error("LLM connection timeout"))
      : vi.fn().mockResolvedValue(structuredResponse),
  })

  it("should classify 'What services do you provide?' as SERVICE_INFO", async () => {
    const mockLLM = createMockLLM({ intent: "SERVICE_INFO", confidence: 0.95 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("What services do you provide?")

    expect(result.intent).toBe(AIIntent.SERVICE_INFO)
    expect(result.confidence).toBe(0.95)
  })

  it("should classify 'Which station has the shortest queue?' as STATION_DISCOVERY", async () => {
    const mockLLM = createMockLLM({ intent: "STATION_DISCOVERY", confidence: 0.92 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("Which station has the shortest queue?")

    expect(result.intent).toBe(AIIntent.STATION_DISCOVERY)
    expect(result.confidence).toBe(0.92)
  })

  it("should classify 'How much does it cost?' as PAYMENT_INFO", async () => {
    const mockLLM = createMockLLM({ intent: "PAYMENT_INFO", confidence: 0.88 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("How much does it cost?")

    expect(result.intent).toBe(AIIntent.PAYMENT_INFO)
    expect(result.confidence).toBe(0.88)
  })

  it("should classify 'What is the cancellation policy?' as POLICY", async () => {
    const mockLLM = createMockLLM({ intent: "POLICY", confidence: 0.94 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("What is the cancellation policy?")

    expect(result.intent).toBe(AIIntent.POLICY)
    expect(result.confidence).toBe(0.94)
  })

  it("should classify 'What is my booking status?' as BOOKING_INFO", async () => {
    const mockLLM = createMockLLM({ intent: "BOOKING_INFO", confidence: 0.96 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("What is my booking status?")

    expect(result.intent).toBe(AIIntent.BOOKING_INFO)
    expect(result.confidence).toBe(0.96)
  })

  it("should classify 'How do I book a car wash?' as FAQ", async () => {
    const mockLLM = createMockLLM({ intent: "FAQ", confidence: 0.9 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("How do I book a car wash?")

    expect(result.intent).toBe(AIIntent.FAQ)
    expect(result.confidence).toBe(0.9)
  })

  it("should classify off-topic 'Tell me a joke' as OUT_OF_SCOPE", async () => {
    const mockLLM = createMockLLM({ intent: "OUT_OF_SCOPE", confidence: 0.99 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("Tell me a joke")

    expect(result.intent).toBe(AIIntent.OUT_OF_SCOPE)
    expect(result.confidence).toBe(0.99)
  })

  it("should gracefully handle malformed classifier output (invalid intent string)", async () => {
    const mockLLM = createMockLLM({ intent: "SOME_RANDOM_INTENT_NOT_ALLOWED", confidence: 0.99 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("Hello world")

    expect(result.intent).toBe(AIIntent.OUT_OF_SCOPE)
    expect(result.confidence).toBe(0)
  })

  it("should gracefully handle LLM provider failure (e.g. network timeout)", async () => {
    const mockLLM = createMockLLM(null, true)
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("What services do you offer?")

    expect(result.intent).toBe(AIIntent.OUT_OF_SCOPE)
    expect(result.confidence).toBe(0)
  })

  it("should clamp invalid confidence values between 0 and 1", async () => {
    const mockLLM = createMockLLM({ intent: "SERVICE_INFO", confidence: 15.0 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("Services?")

    expect(result.intent).toBe(AIIntent.SERVICE_INFO)
    expect(result.confidence).toBe(1)
  })

  it("should immediately return OUT_OF_SCOPE for empty input message", async () => {
    const mockLLM = createMockLLM({ intent: "SERVICE_INFO", confidence: 0.9 })
    const classifier = new OllamaIntentClassifier(mockLLM)

    const result = await classifier.classify("   ")

    expect(result.intent).toBe(AIIntent.OUT_OF_SCOPE)
    expect(result.confidence).toBe(0)
    expect(mockLLM.generateStructured).not.toHaveBeenCalled()
  })
})
