import { describe, it, expect, vi, beforeEach } from "vitest"
import { AskKnowledgeUseCase } from "../ask-knowledge.usecase"
import { ILLMProvider } from "../../../ports/ai-provider.interface"
import { ISearchKnowledgeDocumentUseCase } from "../../../interfaces/knowledge-document-usecases.interface"
import { RetrievedChunk } from "../../../ports/vector.interface"

describe("AskKnowledgeUseCase - RAG Pipeline", () => {
  let mockLLM: ILLMProvider
  let mockSearchUseCase: ISearchKnowledgeDocumentUseCase
  let useCase: AskKnowledgeUseCase

  beforeEach(() => {
    mockLLM = {
      generate: vi
        .fn()
        .mockResolvedValue({ content: "WashQueue offers Express and Deluxe wash packages." }),
    }
    mockSearchUseCase = {
      execute: vi.fn(),
    }
    useCase = new AskKnowledgeUseCase(mockLLM, mockSearchUseCase)
  })

  it("should return immediate response for empty or whitespace prompts without calling LLM", async () => {
    const result = await useCase.execute("   ")

    expect(result).toContain("How can I help you")
    expect(mockSearchUseCase.execute).not.toHaveBeenCalled()
    expect(mockLLM.generate).not.toHaveBeenCalled()
  })

  it("should retrieve context from search and pass formatted context with system prompt to LLM", async () => {
    const mockChunks: RetrievedChunk[] = [
      {
        id: "chunk-1",
        score: 0.85,
        payload: {
          documentId: "doc-1",
          content: "Express Wash takes 15 minutes and costs $15.",
          metadata: { category: "SERVICE", locale: "en", version: 1 },
        },
      },
      {
        id: "chunk-2",
        score: 0.72,
        payload: {
          documentId: "doc-2",
          content: "Deluxe Detailing includes clay bar and interior vacuuming.",
          metadata: { category: "SERVICE", locale: "en", version: 1 },
        },
      },
    ]

    vi.mocked(mockSearchUseCase.execute).mockResolvedValue(mockChunks)

    const result = await useCase.execute("Tell me about wash options")

    expect(result).toBe("WashQueue offers Express and Deluxe wash packages.")
    expect(mockSearchUseCase.execute).toHaveBeenCalledWith({
      query: "Tell me about wash options",
      limit: 4,
      minScore: 0.35,
    })

    expect(mockLLM.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Tell me about wash options",
        systemPrompt: expect.stringContaining("Express Wash takes 15 minutes"),
        temperature: 0.3,
        maxTokens: 512,
      })
    )
  })

  it("should gracefully degrade to LLM base persona if vector search throws an error", async () => {
    vi.mocked(mockSearchUseCase.execute).mockRejectedValue(new Error("Qdrant connection refused"))

    const result = await useCase.execute("What is WashQueue?")

    // Should NOT throw! Should degrade gracefully and generate response with base persona
    expect(result).toBe("WashQueue offers Express and Deluxe wash packages.")
    expect(mockLLM.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "What is WashQueue?",
        systemPrompt: expect.stringContaining("You are Qyn"),
      })
    )
  })

  it("should filter out low-score chunks that fall below relevance threshold", async () => {
    const mockChunks: RetrievedChunk[] = [
      {
        id: "chunk-low",
        score: 0.1, // below 0.35
        payload: {
          documentId: "doc-irrelevant",
          content: "Unrelated text about cafeteria hours.",
          metadata: { category: "GENERAL", locale: "en", version: 1 },
        },
      },
    ]

    vi.mocked(mockSearchUseCase.execute).mockResolvedValue(mockChunks)

    await useCase.execute("How do I book?")

    // Low-score chunk should not be injected into context
    expect(mockLLM.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.not.stringContaining("cafeteria hours"),
      })
    )
  })

  it("should return safe fallback response if LLM returns empty or blank content", async () => {
    vi.mocked(mockSearchUseCase.execute).mockResolvedValue([])
    vi.mocked(mockLLM.generate).mockResolvedValue({ content: "   " })

    const result = await useCase.execute("Can you help me?")

    expect(result).toContain("unable to generate a response at this time")
  })
})
