import { Router } from "express"
import { createKnowledgeDocumentRoutes } from "./presentation/knowledge-document.routes"
import { KnowledgeDocumentController } from "./presentation/knowledge-document.controller"
import { KnowledgeDocumentRepository } from "./infrastructure/repositories/knowledge-document.mongo.repository"
import { CreateKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/create-knowledge-document.use-case"
import { GetKnowledgeDocumentsUseCase } from "./application/usecases/knowledge-document/get-knowledge-documents.use-case"
import { GetKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/get-knowledge-document.use-case"
import { UpdateKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/update-knowledge-document.use-case"
import { DeleteKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/delete-knowledge-document.use-case"
import { IndexKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/index-knowledge-document.usecases"
import { LangChainChunker } from "./infrastructure/services/chunker.service"
import { LocalEmbeddingModel } from "./infrastructure/services/embedding.service"
import { QdrantVectorStore } from "./infrastructure/vector/qdrant.store"
import { SearchKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/search-knowledge-document.usecase"

const aiRouter = Router()

// Orchestration
const knowledgeDocumentRepository = new KnowledgeDocumentRepository()

const chunker = new LangChainChunker()
const embeddingModel = new LocalEmbeddingModel()
const vectorStore = new QdrantVectorStore()

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
  knowledgeDocumentRepository
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
aiRouter.use("/knowledge-documents", createKnowledgeDocumentRoutes(knowledgeDocumentController))

export default aiRouter
