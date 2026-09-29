import { Router } from "express"
import { KnowledgeDocumentController } from "./knowledge-document.controller"
import asyncHandler from "@/common/utils/async-handler"

export const createKnowledgeDocumentRoutes = (controller: KnowledgeDocumentController): Router => {
  const router = Router()

  router.post("/search", asyncHandler(controller.search))
  router.post("/", asyncHandler(controller.create))
  router.get("/", asyncHandler(controller.getAll))
  router.get("/:id", asyncHandler(controller.getById))
  router.put("/:id", asyncHandler(controller.update))
  router.delete("/:id", asyncHandler(controller.delete))

  return router
}
