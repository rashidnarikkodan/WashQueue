import asyncHandler from "@/common/utils/async-handler"
import { Router } from "express"
import { ChatController } from "./chat.controller"

export const createChatRoutes = (controller: ChatController): Router => {
  const router = Router()

  router.post("/", asyncHandler(controller.ask))

  return router
}
