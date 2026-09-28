import { Router } from "express"
import { createKnowledgeDocumentRoutes } from "./presentation/knowledge-document.routes"
import { KnowledgeDocumentController } from "./presentation/knowledge-document.controller"
import { KnowledgeDocumentRepository } from "./infrastructure/repositories/knowledge-document.mongo.repository"
import { CreateKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/create-knowledge-document.use-case"
import { GetKnowledgeDocumentsUseCase } from "./application/usecases/knowledge-document/get-knowledge-documents.use-case"
import { GetKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/get-knowledge-document.use-case"
import { UpdateKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/update-knowledge-document.use-case"
import { DeleteKnowledgeDocumentUseCase } from "./application/usecases/knowledge-document/delete-knowledge-document.use-case"

const repository = new KnowledgeDocumentRepository()
const createUseCase = new CreateKnowledgeDocumentUseCase(repository)
const getAllUseCase = new GetKnowledgeDocumentsUseCase(repository)
const getByIdUseCase = new GetKnowledgeDocumentUseCase(repository)
const updateUseCase = new UpdateKnowledgeDocumentUseCase(repository)
const deleteUseCase = new DeleteKnowledgeDocumentUseCase(repository)

const controller = new KnowledgeDocumentController(
  createUseCase,
  getAllUseCase,
  getByIdUseCase,
  updateUseCase,
  deleteUseCase
)

const aiRouter = Router()

aiRouter.use("/knowledge-documents", createKnowledgeDocumentRoutes(controller))

export default aiRouter
