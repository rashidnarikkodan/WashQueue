import { Router } from "express"
import { KnowledgeDocumentController } from "../controllers/knowledge-document.controller"
import { KnowledgeDocumentService } from "../../application/knowledge-document.service"
import { KnowledgeDocumentRepository } from "../../infrastructure/repositories/knowledge-document.mongo.repository"
import asyncHandler from "@/common/utils/async-handler"

const router = Router()

const repository = new KnowledgeDocumentRepository()
const service = new KnowledgeDocumentService(repository)
const controller = new KnowledgeDocumentController(service)

router.post("/", asyncHandler(controller.create))
router.get("/", asyncHandler(controller.getAll))
router.get("/:id", asyncHandler(controller.getById))
router.put("/:id", asyncHandler(controller.update))
router.delete("/:id", asyncHandler(controller.delete))

export { router as knowledgeDocumentRoutes }
