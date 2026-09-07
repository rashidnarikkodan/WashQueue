import { Request, Response } from "express"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BadRequestError } from "@/common/errors/bad-request-error"
import success from "@/common/utils/success"
import { IHandlePayoutWebhookUseCase } from "../../application/use-cases/handle-payout-webhook.use-case"

export class PayoutWebhookController {
  constructor(private readonly handlePayoutWebhookUseCase: IHandlePayoutWebhookUseCase) {}

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["x-razorpay-signature"] as string
    if (!signature) {
      throw new BadRequestError("Missing x-razorpay-signature header")
    }

    const capturedRawBody = (req as Request & { rawBody?: Buffer }).rawBody
    const rawBody =
      typeof req.body === "string"
        ? req.body
        : capturedRawBody
          ? capturedRawBody.toString("utf-8")
          : JSON.stringify(req.body)

    const result = await this.handlePayoutWebhookUseCase.execute(rawBody, signature)

    if (!result.success) {
      throw new BadRequestError(result.message || "Payout webhook processing failed")
    }

    success(res, result, HTTP_STATUS.OK, "Payout webhook processed")
  }
}
