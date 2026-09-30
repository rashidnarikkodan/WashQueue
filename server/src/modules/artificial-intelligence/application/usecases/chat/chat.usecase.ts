import { AIIntent, IntentResult } from "../../../domain/types/ai-intent"
import { ChatRequestDto, ChatResponseDto, ChatUserContext } from "../../dto/chat.dto"
import { IChatUseCase } from "../../interfaces/chat.usecases"
import { ISearchKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"
import { IIntentClassifier } from "../../ports/intent-classifier.interface"
import { ILLMProvider } from "../../ports/ai-provider.interface"
import { IStationQueryPort, StationSummary } from "../../ports/station-query.port"
import { IQueueQueryPort } from "../../ports/queue-query.port"
import { IBookingQueryPort, BookingSummary } from "../../ports/booking-query.port"
import { BadRequestError } from "@/common/errors/bad-request-error"
import logger from "@/configs/logger.config"

const DOMAIN_GATE_SAFE_RESPONSE =
  "I can help with WashQueue stations, services, bookings, queues, payments, and support."

const RELEVANCE_SCORE_THRESHOLD = 0.35

export class ChatUseCase implements IChatUseCase {
  constructor(
    private readonly intentClassifier: IIntentClassifier,
    private readonly searchKnowledgeUseCase: ISearchKnowledgeDocumentUseCase,
    private readonly llm: ILLMProvider,
    private readonly stationQueryPort: IStationQueryPort,
    private readonly queueQueryPort: IQueueQueryPort,
    private readonly bookingQueryPort: IBookingQueryPort
  ) {}

  async execute(dto: ChatRequestDto, userContext?: ChatUserContext): Promise<ChatResponseDto> {
    const rawMessage = dto?.message ?? ""
    if (!rawMessage || !rawMessage.trim()) {
      throw new BadRequestError("Message cannot be empty")
    }

    const message = rawMessage.trim()

    // 1. Intent Classification
    const classification = await this.intentClassifier.classify(message)
    // 2. Domain Gate
    if (classification.intent === AIIntent.OUT_OF_SCOPE || classification.confidence < 0.25) {
      return {
        message: DOMAIN_GATE_SAFE_RESPONSE,
        intent: AIIntent.OUT_OF_SCOPE,
        confidence: classification.confidence,
      }
    }

    // 3. Routing
    switch (classification.intent) {
      case AIIntent.FAQ:
      case AIIntent.SERVICE_INFO:
      case AIIntent.POLICY:
      case AIIntent.PAYMENT_INFO:
      case AIIntent.SUPPORT_INFO:
        return this.handleKnowledgeQuery(message, classification)

      case AIIntent.STATION_DISCOVERY:
      case AIIntent.RECOMMENDATION:
        return this.handleStationDiscovery(dto, message, classification)

      case AIIntent.QUEUE_INFO:
        return this.handleQueueQuery(dto, message, classification)

      case AIIntent.BOOKING_INFO:
        if (
          /\b(how\s+(?:can|do|to|should)\s+.*book|booking\s+flow|booking\s+process|how\s+to\s+make\s+a\s+booking|steps\s+to\s+book|guide\s+to\s+book|how\s+booking\s+works|flow\s+for\s+booking|whats?\s+(?:the|teh)\s+flow)\b/i.test(
            message
          )
        ) {
          return this.handleKnowledgeQuery(message, {
            intent: AIIntent.FAQ,
            confidence: classification.confidence,
          })
        }
        return this.handleBookingQuery(dto, message, classification, userContext)

      default:
        return {
          message: DOMAIN_GATE_SAFE_RESPONSE,
          intent: AIIntent.OUT_OF_SCOPE,
          confidence: classification.confidence,
        }
    }
  }

  private async handleKnowledgeQuery(
    message: string,
    classification: IntentResult
  ): Promise<ChatResponseDto> {
    try {
      const searchResults = await this.searchKnowledgeUseCase.execute({
        query: message,
        limit: 3,
      })

      // Grounding validation: ensure we have retrieved documents and sufficient relevance
      const relevantResults = searchResults.filter(
        (res) => (res.score ?? 0) >= RELEVANCE_SCORE_THRESHOLD
      )

      if (relevantResults.length === 0) {
        return {
          message:
            "I couldn't find specific WashQueue information answering your question. Please check our help center or contact WashQueue support for further assistance.",
          intent: classification.intent,
          confidence: classification.confidence,
          metadata: { grounded: false },
        }
      }

      const context = relevantResults
        .map((item) => item.payload?.content)
        .filter((c): c is string => Boolean(c))
        .join("\n\n---\n\n")

      const systemPrompt = `You are Qyn, the intelligent AI assistant for WashQueue.
Your task is to answer the user's question accurately and helpfully using ONLY the retrieved WashQueue documentation below.
Rules:
- Strictly base your answer on the provided context.
- If the context does not contain the answer, state clearly that the information is unavailable.
- Do not hallucinate or extrapolate beyond the provided text.
- Maintain a professional, polite, and helpful tone.

Context:
${context}`

      const llmResponse = await this.llm.generate({
        prompt: message,
        systemPrompt,
        temperature: 0.2,
      })

      return {
        message: llmResponse.content.trim(),
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: {
          grounded: true,
          matchedDocumentsCount: relevantResults.length,
        },
      }
    } catch (er) {
      logger.error({ err: er }, "[ChatUseCase] Error retrieving knowledge information")
      return {
        message:
          "I encountered an error retrieving knowledge information. Please contact support or try again later.",
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: { error: true },
      }
    }
  }

  private async handleStationDiscovery(
    dto: ChatRequestDto,
    message: string,
    classification: IntentResult
  ): Promise<ChatResponseDto> {
    const lower = message.toLowerCase()

    const lowQueue =
      lower.includes("short queue") ||
      lower.includes("shortest queue") ||
      lower.includes("least wait") ||
      lower.includes("quickest") ||
      lower.includes("fast") ||
      lower.includes("less wait") ||
      lower.includes("no queue") ||
      classification.intent === AIIntent.RECOMMENDATION

    const highRating =
      lower.includes("best") || lower.includes("top rated") || lower.includes("highest rated")

    // Extract potential station name or city if user explicitly searched for one (e.g. "in Kochi", "at Thrissur")
    let query: string | undefined = undefined
    const locationMatch = message.match(
      /\b(?:in|at|around|for)\s+([A-Za-z0-9\s'-]+?)(?:\?|$|\.|\s+(?:with|having|that))/i
    )
    if (locationMatch && locationMatch[1]) {
      const candidate = locationMatch[1].trim()
      const noise = [
        "the queue",
        "queue",
        "washqueue",
        "my area",
        "this area",
        "the moment",
        "the morning",
        "the evening",
      ]
      if (!noise.includes(candidate.toLowerCase()) && candidate.length > 2) {
        query = candidate
      }
    }

    const stations = await this.stationQueryPort.searchStations({
      query,
      latitude: dto.latitude,
      longitude: dto.longitude,
      lowQueue,
      minRating: highRating ? 4.0 : undefined,
      limit: 4,
    })

    if (stations.length === 0) {
      return {
        message:
          "No active WashQueue stations were found matching your criteria. Try searching in another area or check back later.",
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: { count: 0 },
      }
    }

    const stationFacts = stations
      .map(
        (s, idx) =>
          `${idx + 1}. **${s.name}** (${s.address.city})\n   - Status: ${s.isOpen ? "Open" : "Closed"}\n   - Queue: ${s.queueDepth} car(s) waiting (~${s.estimatedWaitMins} min wait)\n   - Rating: ⭐ ${s.rating.toFixed(1)} (${s.reviewCount} reviews)\n   - Total Bays: ${s.bays}`
      )
      .join("\n\n")

    try {
      const systemPrompt = `You are Qyn, WashQueue's AI assistant.
Summarize the following verified station data for the user in a helpful, concise way.
Rules:
- Strictly use the provided station facts below. Do NOT fabricate wait times, bays, or ratings.
- Clearly highlight open status and wait times.
- If recommending, suggest the top-ranked station from the list.

Station Facts:
${stationFacts}`

      const llmResponse = await this.llm.generate({
        prompt: `User asked: "${message}". Please present the stations accurately.`,
        systemPrompt,
        temperature: 0.2,
      })

      return {
        message: llmResponse.content.trim(),
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: {
          stationsCount: stations.length,
          topStation: stations[0]?.name,
        },
      }
    } catch {
      // Deterministic fallback if LLM is unavailable
      const fallbackMsg = `Here are the top WashQueue stations for you:\n\n${stationFacts}`
      return {
        message: fallbackMsg,
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: { stationsCount: stations.length },
      }
    }
  }

  private async handleQueueQuery(
    dto: ChatRequestDto,
    message: string,
    classification: IntentResult
  ): Promise<ChatResponseDto> {
    let stationSummary: StationSummary | null = null

    if (dto.stationId) {
      stationSummary = await this.stationQueryPort.findStationByNameOrId(dto.stationId)
    }

    if (!stationSummary) {
      // Extract possible station name from query
      const cleaned = message
        .replace(
          /how long is the queue at|queue at|queue for|queue in|wait time at|wait time for/gi,
          ""
        )
        .replace(/queue|wait|time|status|\?/gi, "")
        .trim()

      if (cleaned.length > 2) {
        stationSummary = await this.stationQueryPort.findStationByNameOrId(cleaned)
      }
    }

    if (!stationSummary) {
      // If no station specified, offer helpful prompt and top available stations
      const topStations = await this.stationQueryPort.searchStations({ limit: 3, lowQueue: true })
      const stationList = topStations.map((s) => s.name).join(", ")

      return {
        message: stationList
          ? `Which station's queue would you like to check? For example, you can check: ${stationList}.`
          : "Which station's queue would you like to check? Please provide the station name.",
        intent: classification.intent,
        confidence: classification.confidence,
      }
    }

    const liveData = await this.queueQueryPort.getStationQueue(stationSummary.id)
    if (!liveData) {
      return {
        message: `Live queue data is currently unavailable for ${stationSummary.name}. Please check back shortly or visit the station page.`,
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: { stationId: stationSummary.id, live: false },
      }
    }

    if (!liveData.isOpen) {
      return {
        message: `${liveData.stationName} is currently closed. Operating hours and live queues will update when the station opens.`,
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: {
          stationId: liveData.stationId,
          isOpen: false,
        },
      }
    }

    const responseMsg = `At **${liveData.stationName}**:\n- **Current Queue**: ${liveData.queueDepth} vehicle(s) waiting\n- **Estimated Wait Time**: ~${liveData.estimatedWaitMins} minute(s)\n- **Active Bays**: ${liveData.activeServicesCount} in progress\n- **Available Bays**: ${liveData.availableBays} of ${liveData.totalBays}`

    return {
      message: responseMsg,
      intent: classification.intent,
      confidence: classification.confidence,
      metadata: {
        stationId: liveData.stationId,
        queueDepth: liveData.queueDepth,
        estimatedWaitMins: liveData.estimatedWaitMins,
        availableBays: liveData.availableBays,
        totalBays: liveData.totalBays,
        isLive: liveData.isLive,
      },
    }
  }

  private async handleBookingQuery(
    dto: ChatRequestDto,
    message: string,
    classification: IntentResult,
    userContext?: ChatUserContext
  ): Promise<ChatResponseDto> {
    if (!userContext?.userId) {
      return {
        message: "Please log in to your WashQueue account to view your booking information.",
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: { authenticated: false },
      }
    }

    const userId = userContext.userId

    // Extract booking reference if provided in DTO or message
    let bookingNumber = dto.bookingNumber
    if (!bookingNumber) {
      const match = message.match(/\b(WQ-[A-Za-z0-9-]+|[0-9a-f]{24})\b/i)
      if (match) {
        bookingNumber = match[1]
      }
    }

    if (bookingNumber) {
      const booking = await this.bookingQueryPort.getBookingByNumber(bookingNumber, userId)
      if (!booking) {
        return {
          message: `I couldn't find a booking with reference "${bookingNumber}" under your account. Please check the booking number and try again.`,
          intent: classification.intent,
          confidence: classification.confidence,
          metadata: { found: false },
        }
      }

      return {
        message: this.formatBookingSummary(booking),
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: { bookingId: booking.id, bookingNumber: booking.bookingNumber },
      }
    }

    // If the query is a general procedural question rather than personal booking lookup, route to knowledge query
    const isProcedural =
      !bookingNumber &&
      /\b(how|what|steps|flow|process|guide|rule|can i|do i need|where can i)\b/i.test(message)
    if (isProcedural) {
      return this.handleKnowledgeQuery(message, {
        intent: AIIntent.FAQ,
        confidence: classification.confidence,
      })
    }

    // Fetch user's recent bookings
    const bookings = await this.bookingQueryPort.getUserBookings(userId, 3)
    if (bookings.length === 0) {
      return {
        message:
          "You don't have any bookings associated with your account yet. Let me know if you would like help finding a station to book!",
        intent: classification.intent,
        confidence: classification.confidence,
        metadata: { bookingsCount: 0 },
      }
    }

    const list = bookings.map((b) => this.formatBookingSummary(b)).join("\n\n---\n\n")
    return {
      message: `Here are your recent bookings:\n\n${list}`,
      intent: classification.intent,
      confidence: classification.confidence,
      metadata: { bookingsCount: bookings.length },
    }
  }

  private formatBookingSummary(booking: BookingSummary): string {
    const timeFormatted = booking.scheduledStart
      ? new Date(booking.scheduledStart).toLocaleString()
      : "Not scheduled"

    return `📋 **Booking #${booking.bookingNumber}**\n- **Status**: ${booking.status}\n- **Station**: ${booking.stationName || "WashQueue Station"}\n- **Service**: ${booking.serviceType}\n- **Scheduled Time**: ${timeFormatted}\n- **Vehicle**: ${booking.vehicleInfo || "Vehicle"}\n- **Payment Status**: ${booking.paymentStatus}`
  }
}
