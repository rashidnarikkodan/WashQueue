import { IAskKnowledgeUseCase } from "../../interfaces/chat.usecases"
import { ISearchKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"
import { ILLMProvider } from "../../ports/ai-provider.interface"
import { RetrievedChunk } from "../../ports/vector.interface"
import logger from "@/configs/logger.config"

const SYSTEM_PERSONA_PROMPT = `You are Qyn, the friendly and intelligent AI Assistant for WashQueue — an automated car wash scheduling and queue management platform.

Your mission is to provide accurate, helpful, and concise answers to customers, station managers, and owners regarding:
- Car wash packages (e.g. Express Wash, Deluxe Wash, Interior Detailing, Ceramic Coating)
- Live queue positions, bay tracking, and estimated wait times
- Appointments, cancellations, refunds, and rescheduling rules
- Wallet transactions, top-ups, and online/station payment methods
- Station facilities, opening hours, and operating guidelines

Instructions:
1. Ground your answer in the provided Reference Context whenever available.
2. If the context does not contain the answer, provide a safe, helpful general answer and advise the user to check their active booking in the app or contact station support.
3. Be professional, clear, and direct. Keep responses concise (under 3-4 paragraphs).
4. Never invent nonexistent transaction IDs, personal customer details, or contradictory refund policies.`

const MAX_CONTEXT_CHARS = 3500
const MIN_SEARCH_SCORE = 0.35

export class AskKnowledgeUseCase implements IAskKnowledgeUseCase {
  constructor(
    private readonly llm: ILLMProvider,
    private readonly searchUseCase: ISearchKnowledgeDocumentUseCase
  ) {}

  async execute(prompt: string): Promise<string> {
    const trimmedPrompt = prompt?.trim()
    if (!trimmedPrompt) {
      return "Hello! How can I help you with your WashQueue booking or services today?"
    }

    let retrieved: RetrievedChunk[] = []
    try {
      retrieved = await this.searchUseCase.execute({
        query: trimmedPrompt,
        limit: 4,
        minScore: MIN_SEARCH_SCORE,
      })
    } catch (searchError: unknown) {
      logger.warn(
        { err: searchError },
        "[AskKnowledgeUseCase] Vector search retrieval failed; degrading gracefully to direct LLM response"
      )
    }

    const validChunks = (retrieved || [])
      .filter((item) => Boolean(item?.payload?.content))
      .filter((item) => item.score === undefined || item.score >= MIN_SEARCH_SCORE)
      .slice(0, 4)

    let systemPrompt = SYSTEM_PERSONA_PROMPT

    if (validChunks.length > 0) {
      const contextText = validChunks
        .map((chunk, index) => {
          const category = chunk.payload?.metadata?.category
            ? ` [Category: ${chunk.payload.metadata.category}]`
            : ""
          return `--- Source Document ${index + 1}${category} ---\n${chunk.payload.content.trim()}`
        })
        .join("\n\n")
        .slice(0, MAX_CONTEXT_CHARS)

      systemPrompt = `${SYSTEM_PERSONA_PROMPT}\n\n=== Reference Context from WashQueue Knowledge Base ===\n${contextText}\n=== End of Reference Context ===`
    }

    const output = await this.llm.generate({
      prompt: trimmedPrompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 512,
    })

    const finalAnswer = output.content?.trim()
    if (!finalAnswer) {
      return "I'm sorry, I was unable to generate a response at this time. Please rephrase your question or try again shortly."
    }

    return finalAnswer
  }
}
