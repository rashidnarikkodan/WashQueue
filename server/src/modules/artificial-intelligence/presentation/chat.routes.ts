import asyncHandler from "@/common/utils/async-handler"
import { Router } from "express"
import { ChatController } from "./chat.controller"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"

export const createChatRoutes = (controller: ChatController): Router => {
  const router = Router()

  router.post("/", authenticate, asyncHandler(controller.chat))
  router.post("/ask", authenticate, asyncHandler(controller.ask))

  return router
}
