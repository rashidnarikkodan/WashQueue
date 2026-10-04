import { Router } from "express"
import asyncHandler from "@/common/utils/async-handler"
import { ChatController } from "./chat.controller"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { askChatSchema } from "./schema/chat.schema"

export const createChatRoutes = (controller: ChatController): Router => {
  const router = Router()

  router.post(
    "/",
    authenticate,
    validateRequest(askChatSchema, "body"),
    asyncHandler(controller.ask)
  )

  return router
}
