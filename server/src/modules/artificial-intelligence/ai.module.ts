import { Router } from "express"
import { createKnowledgeDocumentRoutes } from "./presentation/knowledge-document.routes"
import { KnowledgeDocumentController } from "./presentation/knowledge-document.controller"
import { KnowledgeDocumentRepository } from "./infrastructure/repositories/knowledge-document.mongo.repository"
import { CreateKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/create-knowledge-document.use-case"
import { GetKnowledgeDocumentsUseCase } from "./application/usecases/knowledge-document/get-knowledge-documents.use-case"
import { GetKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/get-knowledge-document.use-case"
import { UpdateKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/update-knowledge-document.use-case"
import { DeleteKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/delete-knowledge-document.use-case"
import { IndexKnowledgeDocumentUseCase } from "./application/usecases/indexing/index-knowledge-document.usecases"
import { LangChainChunker } from "./infrastructure/services/chunker.service"
import { LocalEmbeddingModel } from "./infrastructure/services/embedding.service"
import { QdrantVectorStore } from "./infrastructure/vector/qdrant.store"
import { OllamaProvider } from "./infrastructure/llm/ollama.llm"
import { SearchKnowledgeDocumentUseCase } from "./application/usecases/search/search-knowledge-document.usecase"
import { createChatRoutes } from "./presentation/chat.routes"
import { ChatController } from "./presentation/chat.controller"
import { AskKnowledgeUseCase } from "./application/usecases/chat/ask-knowledge.usecase"
import { ChatUseCase } from "./application/usecases/chat/chat.usecase"
import { OllamaIntentClassifier } from "./infrastructure/intent/ollama.intent-classifier"
import { StationQueryAdapter } from "./infrastructure/adapters/station-query.adapter"
import { QueueQueryAdapter } from "./infrastructure/adapters/queue-query.adapter"
import { BookingQueryAdapter } from "./infrastructure/adapters/booking-query.adapter"
import { stationRepository } from "@/modules/station/station.module"
import { bookingRepository } from "@/modules/booking/booking.module"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"

const aiRouter = Router()

aiRouter.use(authenticate)

// Orchestration
const knowledgeDocumentRepository = new KnowledgeDocumentRepository()

const chunker = new LangChainChunker()
const embeddingModel = new LocalEmbeddingModel()
const vectorStore = new QdrantVectorStore()
const llmProvider = new OllamaProvider()

const indexKnowledgeDocumentUseCase = new IndexKnowledgeDocumentUseCase(
  chunker,
  embeddingModel,
  knowledgeDocumentRepository,
  vectorStore
)

const createKnowledgeDocumentUseCase = new CreateKnowledgeDocumentUseCase(
  knowledgeDocumentRepository,
  indexKnowledgeDocumentUseCase
)

const getKnowledgeDocumentsUseCase = new GetKnowledgeDocumentsUseCase(knowledgeDocumentRepository)

const getKnowledgeDocumentUseCase = new GetKnowledgeDocumentUseCase(knowledgeDocumentRepository)

const updateKnowledgeDocumentUseCase = new UpdateKnowledgeDocumentUseCase(
  knowledgeDocumentRepository,
  indexKnowledgeDocumentUseCase
)

const deleteKnowledgeDocumentUseCase = new DeleteKnowledgeDocumentUseCase(
  knowledgeDocumentRepository,
  vectorStore
)

const searchKnowledgeDocumentUseCase = new SearchKnowledgeDocumentUseCase(
  embeddingModel,
  vectorStore
)

const knowledgeDocumentController = new KnowledgeDocumentController(
  createKnowledgeDocumentUseCase,
  getKnowledgeDocumentsUseCase,
  getKnowledgeDocumentUseCase,
  updateKnowledgeDocumentUseCase,
  deleteKnowledgeDocumentUseCase,
  searchKnowledgeDocumentUseCase
)

// Intent Classification & Routing Wiring
const intentClassifier = new OllamaIntentClassifier(llmProvider)
const stationQueryPort = new StationQueryAdapter(stationRepository)
const queueQueryPort = new QueueQueryAdapter(stationRepository)
const bookingQueryPort = new BookingQueryAdapter(bookingRepository)
const askKnowledgeUseCase = new AskKnowledgeUseCase(llmProvider, searchKnowledgeDocumentUseCase)

export const chatUseCase = new ChatUseCase(
  intentClassifier,
  searchKnowledgeDocumentUseCase,
  llmProvider,
  stationQueryPort,
  queueQueryPort,
  bookingQueryPort
)

const chatController = new ChatController(chatUseCase, askKnowledgeUseCase)

aiRouter.use("/knowledge-documents", createKnowledgeDocumentRoutes(knowledgeDocumentController))
aiRouter.use("/chat", createChatRoutes(chatController))

export default aiRouter
