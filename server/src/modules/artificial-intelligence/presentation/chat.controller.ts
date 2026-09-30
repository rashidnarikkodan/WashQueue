import { Response } from "express"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { IChatUseCase, IAskKnowledgeUseCase } from "../application/interfaces/chat.usecases"

export class ChatController {
  constructor(
    private readonly chatUseCase: IChatUseCase,
    private readonly askUseCase?: IAskKnowledgeUseCase
  ) {}

  chat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { message, prompt, latitude, longitude, stationId, bookingNumber } = req.body

    const effectiveMessage = message ?? prompt ?? ""

    const userContext = req.user
      ? {
          userId: req.user.userId,
          email: req.user.email,
          role: req.user.role,
        }
      : undefined

    const result = await this.chatUseCase.execute(
      {
        message: effectiveMessage,
        latitude,
        longitude,
        stationId,
        bookingNumber,
      },
      userContext
    )

    success(res, result, HTTP_STATUS.OK, "Message processed successfully")
  }

  ask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { prompt, message } = req.body
    const query = prompt ?? message ?? ""

    if (this.askUseCase) {
      const result = await this.askUseCase.execute(query)
      success(res, result, HTTP_STATUS.OK, "Response generated successfully")
    } else {
      await this.chat(req, res)
    }
  }
}
