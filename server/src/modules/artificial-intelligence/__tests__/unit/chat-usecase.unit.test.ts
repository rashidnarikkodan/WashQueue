import { describe, it, expect, vi, beforeEach } from "vitest"
import { ChatUseCase } from "../../application/usecases/chat/chat.usecase"
import { IIntentClassifier } from "../../application/ports/intent-classifier.interface"
import { ISearchKnowledgeDocumentUseCase } from "../../application/interfaces/knowledge-document-usecases.interface"
import { ILLMProvider } from "../../application/ports/ai-provider.interface"
import { IStationQueryPort, StationSummary } from "../../application/ports/station-query.port"
import { IQueueQueryPort, StationLiveQueueData } from "../../application/ports/queue-query.port"
import { IBookingQueryPort, BookingSummary } from "../../application/ports/booking-query.port"
import { AIIntent } from "../../domain/types/ai-intent"
import { BadRequestError } from "@/common/errors/bad-request-error"

describe("ChatUseCase Orchestrator & Routing (Unit Tests)", () => {
  let intentClassifier: IIntentClassifier
  let searchKnowledgeUseCase: ISearchKnowledgeDocumentUseCase
  let llm: ILLMProvider
  let stationQueryPort: IStationQueryPort
  let queueQueryPort: IQueueQueryPort
  let bookingQueryPort: IBookingQueryPort
  let chatUseCase: ChatUseCase

  beforeEach(() => {
    intentClassifier = {
      classify: vi.fn(),
    }

    searchKnowledgeUseCase = {
      execute: vi.fn(),
    }

    llm = {
      generate: vi.fn().mockResolvedValue({ content: "Grounded LLM answer" }),
      generateStructured: vi.fn(),
    }

    stationQueryPort = {
      searchStations: vi.fn().mockResolvedValue([]),
      findStationByNameOrId: vi.fn().mockResolvedValue(null),
    }

    queueQueryPort = {
      getStationQueue: vi.fn().mockResolvedValue(null),
      findStationByName: vi.fn().mockResolvedValue(null),
    }

    bookingQueryPort = {
      getUserBookings: vi.fn().mockResolvedValue([]),
      getBookingByNumber: vi.fn().mockResolvedValue(null),
    }

    chatUseCase = new ChatUseCase(
      intentClassifier,
      searchKnowledgeUseCase,
      llm,
      stationQueryPort,
      queueQueryPort,
      bookingQueryPort
    )
  })

  // 1. Validation
  describe("Input Validation", () => {
    it("should throw BadRequestError when message is empty or whitespace", async () => {
      await expect(chatUseCase.execute({ message: "" })).rejects.toThrow(BadRequestError)
      await expect(chatUseCase.execute({ message: "   " })).rejects.toThrow(BadRequestError)
    })
  })

  // 2. Domain Gate
  describe("Domain Gate & Safe Fallback", () => {
    it("should immediately return safe response for OUT_OF_SCOPE messages without calling RAG", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.OUT_OF_SCOPE,
        confidence: 0.95,
      })

      const response = await chatUseCase.execute({ message: "Tell me a joke" })

      expect(response.intent).toBe(AIIntent.OUT_OF_SCOPE)
      expect(response.message).toBe(
        "I can help with WashQueue stations, services, bookings, queues, payments, and support."
      )
      expect(searchKnowledgeUseCase.execute).not.toHaveBeenCalled()
      expect(llm.generate).not.toHaveBeenCalled()
    })

    it("should trigger domain gate when classifier confidence is very low (< 0.25)", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.SERVICE_INFO,
        confidence: 0.15,
      })

      const response = await chatUseCase.execute({ message: "Something ambiguous" })

      expect(response.intent).toBe(AIIntent.OUT_OF_SCOPE)
      expect(response.message).toBe(
        "I can help with WashQueue stations, services, bookings, queues, payments, and support."
      )
      expect(searchKnowledgeUseCase.execute).not.toHaveBeenCalled()
    })
  })

  // 3. Knowledge / RAG Grounding
  describe("Knowledge Query Routing (RAG)", () => {
    it("should ground knowledge response when relevant documents are found", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.SERVICE_INFO,
        confidence: 0.92,
      })

      vi.mocked(searchKnowledgeUseCase.execute).mockResolvedValue([
        {
          id: "doc-1",
          score: 0.85,
          payload: {
            documentId: "doc-1",
            content: "WashQueue offers Express Wash and Deluxe Detailing.",
            metadata: { chunkIndex: 0, totalChunks: 1, category: "FAQ", locale: "en", version: 1 },
          },
        },
      ])

      vi.mocked(llm.generate).mockResolvedValue({
        content: "WashQueue offers Express Wash and Deluxe Detailing services.",
      })

      const response = await chatUseCase.execute({ message: "What services do you provide?" })

      expect(response.intent).toBe(AIIntent.SERVICE_INFO)
      expect(response.message).toBe("WashQueue offers Express Wash and Deluxe Detailing services.")
      expect(response.metadata?.grounded).toBe(true)
      expect(llm.generate).toHaveBeenCalledTimes(1)
    })

    it("should return controlled refusal when RAG returns no results or score is below threshold", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.POLICY,
        confidence: 0.88,
      })

      vi.mocked(searchKnowledgeUseCase.execute).mockResolvedValue([
        {
          id: "doc-2",
          score: 0.2, // Below 0.35 threshold
          payload: {
            documentId: "doc-2",
            content: "Unrelated text",
            metadata: {
              chunkIndex: 0,
              totalChunks: 1,
              category: "POLICY",
              locale: "en",
              version: 1,
            },
          },
        },
      ])

      const response = await chatUseCase.execute({ message: "What is your refund policy?" })

      expect(response.intent).toBe(AIIntent.POLICY)
      expect(response.message).toContain("I couldn't find specific WashQueue information")
      expect(response.metadata?.grounded).toBe(false)
      expect(llm.generate).not.toHaveBeenCalled()
    })

    it("should handle RAG search errors gracefully without crashing", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.FAQ,
        confidence: 0.9,
      })

      vi.mocked(searchKnowledgeUseCase.execute).mockRejectedValue(new Error("Qdrant unavailable"))

      const response = await chatUseCase.execute({ message: "How does queueing work?" })

      expect(response.intent).toBe(AIIntent.FAQ)
      expect(response.message).toContain("error retrieving knowledge information")
      expect(response.metadata?.error).toBe(true)
    })
  })

  // 4. Station Discovery & Recommendation
  describe("Station Discovery Routing", () => {
    const mockStations: StationSummary[] = [
      {
        id: "st-1",
        name: "Downtown Express Wash",
        address: { street: "123 Main St", city: "Metroville" },
        rating: 4.8,
        reviewCount: 120,
        isOpen: true,
        queueDepth: 1,
        estimatedWaitMins: 10,
        bays: 3,
      },
      {
        id: "st-2",
        name: "Northside Auto Spa",
        address: { street: "456 North Ave", city: "Metroville" },
        rating: 4.2,
        reviewCount: 85,
        isOpen: false,
        queueDepth: 0,
        estimatedWaitMins: 0,
        bays: 2,
      },
    ]

    it("should search and rank stations deterministically when user asks for shortest queue", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.STATION_DISCOVERY,
        confidence: 0.93,
      })

      vi.mocked(stationQueryPort.searchStations).mockResolvedValue(mockStations)
      vi.mocked(llm.generate).mockResolvedValue({
        content: "I recommend Downtown Express Wash with only 1 car waiting (~10 min wait).",
      })

      const response = await chatUseCase.execute({
        message: "Which station has the shortest queue near me?",
        latitude: 12.97,
        longitude: 77.59,
      })

      expect(response.intent).toBe(AIIntent.STATION_DISCOVERY)
      expect(stationQueryPort.searchStations).toHaveBeenCalledWith(
        expect.objectContaining({
          lowQueue: true,
          latitude: 12.97,
          longitude: 77.59,
        })
      )
      expect(response.metadata?.topStation).toBe("Downtown Express Wash")
    })

    it("should return controlled message when no stations match criteria", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.STATION_DISCOVERY,
        confidence: 0.85,
      })

      vi.mocked(stationQueryPort.searchStations).mockResolvedValue([])

      const response = await chatUseCase.execute({ message: "Find a wash station in Antarctica" })

      expect(response.message).toContain("No active WashQueue stations were found")
      expect(llm.generate).not.toHaveBeenCalled()
    })
  })

  // 5. Queue Information
  describe("Queue Information Routing", () => {
    it("should return live queue details when specific station is found", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.QUEUE_INFO,
        confidence: 0.94,
      })

      const station: StationSummary = {
        id: "st-10",
        name: "Central Wash Station",
        address: { street: "Central Rd", city: "Downtown" },
        rating: 4.5,
        reviewCount: 50,
        isOpen: true,
        queueDepth: 2,
        estimatedWaitMins: 15,
        bays: 2,
      }

      const liveQueue: StationLiveQueueData = {
        stationId: "st-10",
        stationName: "Central Wash Station",
        isOpen: true,
        queueDepth: 2,
        estimatedWaitMins: 15,
        totalBays: 2,
        availableBays: 1,
        activeServicesCount: 1,
        isLive: true,
      }

      vi.mocked(stationQueryPort.findStationByNameOrId).mockResolvedValue(station)
      vi.mocked(queueQueryPort.getStationQueue).mockResolvedValue(liveQueue)

      const response = await chatUseCase.execute({
        message: "How long is the queue at Central Wash Station?",
      })

      expect(response.intent).toBe(AIIntent.QUEUE_INFO)
      expect(response.message).toContain("Central Wash Station")
      expect(response.message).toContain("2 vehicle(s) waiting")
      expect(response.message).toContain("~15 minute(s)")
      expect(response.metadata?.isLive).toBe(true)
    })

    it("should return uncertainty message if live queue data is unavailable", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.QUEUE_INFO,
        confidence: 0.9,
      })

      const station: StationSummary = {
        id: "st-20",
        name: "Lakeside Wash",
        address: { street: "Lake Rd", city: "East" },
        rating: 4.0,
        reviewCount: 30,
        isOpen: true,
        queueDepth: 0,
        estimatedWaitMins: 0,
        bays: 1,
      }

      vi.mocked(stationQueryPort.findStationByNameOrId).mockResolvedValue(station)
      vi.mocked(queueQueryPort.getStationQueue).mockResolvedValue(null)

      const response = await chatUseCase.execute({
        message: "What is the queue status at Lakeside Wash?",
      })

      expect(response.message).toContain(
        "Live queue data is currently unavailable for Lakeside Wash"
      )
      expect(response.metadata?.live).toBe(false)
    })

    it("should notify user when station is closed", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.QUEUE_INFO,
        confidence: 0.9,
      })

      const station: StationSummary = {
        id: "st-30",
        name: "Airport Car Wash",
        address: { street: "Airport Rd", city: "Metro" },
        rating: 4.1,
        reviewCount: 20,
        isOpen: false,
        queueDepth: 0,
        estimatedWaitMins: 0,
        bays: 2,
      }

      const closedQueue: StationLiveQueueData = {
        stationId: "st-30",
        stationName: "Airport Car Wash",
        isOpen: false,
        queueDepth: 0,
        estimatedWaitMins: 0,
        totalBays: 2,
        availableBays: 2,
        activeServicesCount: 0,
        isLive: true,
      }

      vi.mocked(stationQueryPort.findStationByNameOrId).mockResolvedValue(station)
      vi.mocked(queueQueryPort.getStationQueue).mockResolvedValue(closedQueue)

      const response = await chatUseCase.execute({
        message: "Queue at Airport Car Wash?",
      })

      expect(response.message).toContain("Airport Car Wash is currently closed")
      expect(response.metadata?.isOpen).toBe(false)
    })
  })

  // 6. Booking Information
  describe("Booking Information Routing", () => {
    it("should prompt user to log in when userContext is missing", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.BOOKING_INFO,
        confidence: 0.95,
      })

      const response = await chatUseCase.execute({
        message: "What is my booking status?",
      })

      expect(response.intent).toBe(AIIntent.BOOKING_INFO)
      expect(response.message).toContain("Please log in to your WashQueue account")
      expect(bookingQueryPort.getUserBookings).not.toHaveBeenCalled()
    })

    it("should return booking status when booking reference is specified", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.BOOKING_INFO,
        confidence: 0.97,
      })

      const mockBooking: BookingSummary = {
        id: "b-1",
        bookingNumber: "WQ-123456",
        status: "CONFIRMED",
        stationName: "Grand Central Wash",
        scheduledStart: new Date("2026-10-01T10:00:00Z"),
        scheduledEnd: new Date("2026-10-01T10:45:00Z"),
        vehicleInfo: "Honda Civic ABC-123",
        serviceType: "FULL",
        paymentStatus: "PAID",
        depositAmount: 25,
      }

      vi.mocked(bookingQueryPort.getBookingByNumber).mockResolvedValue(mockBooking)

      const response = await chatUseCase.execute(
        { message: "Check status of WQ-123456" },
        { userId: "usr-42" }
      )

      expect(bookingQueryPort.getBookingByNumber).toHaveBeenCalledWith("WQ-123456", "usr-42")
      expect(response.message).toContain("Booking #WQ-123456")
      expect(response.message).toContain("CONFIRMED")
      expect(response.message).toContain("Grand Central Wash")
    })

    it("should prevent unauthorized booking access across users (returns not found)", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.BOOKING_INFO,
        confidence: 0.95,
      })

      // Adapter returns null when booking belongs to another user
      vi.mocked(bookingQueryPort.getBookingByNumber).mockResolvedValue(null)

      const response = await chatUseCase.execute(
        { message: "Status of booking WQ-999999" },
        { userId: "attacker-user-id" }
      )

      expect(response.message).toContain('couldn\'t find a booking with reference "WQ-999999"')
      expect(response.metadata?.found).toBe(false)
    })

    it("should list recent bookings when user has bookings and did not provide reference", async () => {
      vi.mocked(intentClassifier.classify).mockResolvedValue({
        intent: AIIntent.BOOKING_INFO,
        confidence: 0.95,
      })

      const mockBookings: BookingSummary[] = [
        {
          id: "b-1",
          bookingNumber: "WQ-111",
          status: "IN_SERVICE",
          stationName: "Station A",
          serviceType: "EXPRESS",
          paymentStatus: "PAID",
          depositAmount: 15,
        },
      ]

      vi.mocked(bookingQueryPort.getUserBookings).mockResolvedValue(mockBookings)

      const response = await chatUseCase.execute(
        { message: "Where is my booking?" },
        { userId: "usr-1" }
      )

      expect(response.message).toContain("Here are your recent bookings")
      expect(response.message).toContain("WQ-111")
      expect(response.message).toContain("IN_SERVICE")
    })

    it("should confirm Qyn never executes booking mutations", () => {
      // Introspection test: verify that chatUseCase has no methods that mutate bookings
      const properties = Object.getOwnPropertyNames(Object.getPrototypeOf(chatUseCase))
      const mutationKeywords = [
        "create",
        "cancel",
        "reschedule",
        "update",
        "modify",
        "delete",
        "pay",
      ]
      mutationKeywords.forEach((kw) => {
        const hasMutationMethod = properties.some((prop) => prop.toLowerCase().includes(kw))
        expect(hasMutationMethod).toBe(false)
      })
    })
  })
})
