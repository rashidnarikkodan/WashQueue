import { Request, Response } from "express"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IAskKnowledgeUseCase } from "../application/interfaces/chat.usecases"

export class ChatController {
  constructor(private readonly askUseCase: IAskKnowledgeUseCase) {}

  ask = async (req: Request, res: Response): Promise<void> => {
    const { prompt } = req.body

    const result = await this.askUseCase.execute(prompt)
    success(res, result, HTTP_STATUS.OK, "Response generated successfully")
  }
}
