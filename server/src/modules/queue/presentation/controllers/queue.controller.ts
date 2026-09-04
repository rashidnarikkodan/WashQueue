import { Request, Response } from "express"
import cloudinary from "@/configs/cloudinary.config"
import env from "@/configs/env.config"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import success from "@/common/utils/success"
import {
  ICompleteHandoverUseCase,
  IGetOperationalQueueUseCase,
  IGetPublicStationQueueUseCase,
  IResolveStalledBookingUseCase,
  ISavePostInspectionUseCase,
  ISavePreInspectionAndCheckInUseCase,
  IStartServiceUseCase,
  IStallBookingUseCase,
  IValidateQRForCheckInUseCase,
} from "../../application/interfaces/queue-usecases.interface"

export class QueueController {
  constructor(
    private readonly validateQrUseCase: IValidateQRForCheckInUseCase,
    private readonly savePreInspectionUseCase: ISavePreInspectionAndCheckInUseCase,
    private readonly getOperationalQueueUseCase: IGetOperationalQueueUseCase,
    private readonly startServiceUseCase: IStartServiceUseCase,
    private readonly savePostInspectionUseCase: ISavePostInspectionUseCase,
    private readonly completeHandoverUseCase: ICompleteHandoverUseCase,
    private readonly stallBookingUseCase: IStallBookingUseCase,
    private readonly resolveStalledBookingUseCase: IResolveStalledBookingUseCase,
    private readonly getPublicStationQueueUseCase: IGetPublicStationQueueUseCase
  ) {}

  getPublicStationQueue = async (req: Request, res: Response): Promise<void> => {
    const { stationId } = req.params as { stationId: string }
    const publicQueueData = await this.getPublicStationQueueUseCase.execute(stationId)
    success(
      res,
      publicQueueData,
      HTTP_STATUS.OK,
      "Public station live queue retrieved successfully"
    )
  }

  getOperationalQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { stationId } = req.params as { stationId: string }
    const queueData = await this.getOperationalQueueUseCase.execute(managerUserId, stationId)
    success(res, queueData, HTTP_STATUS.OK, "Operational queue retrieved successfully")
  }

  validateQr = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const booking = await this.validateQrUseCase.execute(managerUserId, req.body)
    success(res, booking, HTTP_STATUS.OK, "QR Code validated successfully")
  }

  getInspectionUploadSignature = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const timestamp = Math.round(Date.now() / 1000)
    const folder = "washqueue/inspections"
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      env.CLOUDINARY_API_SECRET
    )

    success(
      res,
      {
        signature,
        timestamp,
        folder,
        apiKey: env.CLOUDINARY_API_KEY,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
      },
      HTTP_STATUS.OK,
      "Cloudinary upload signature generated"
    )
  }

  submitPreInspection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.savePreInspectionUseCase.execute(managerUserId, {
      bookingId,
      ...req.body,
    })
    success(res, booking, HTTP_STATUS.OK, "Pre-service inspection completed and vehicle checked in")
  }

  startService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.startServiceUseCase.execute(managerUserId, bookingId)
    success(res, booking, HTTP_STATUS.OK, "Wash service started successfully")
  }

  submitPostInspection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.savePostInspectionUseCase.execute(managerUserId, {
      bookingId,
      ...req.body,
    })
    success(res, booking, HTTP_STATUS.OK, "Post-service inspection completed successfully")
  }

  completeHandover = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.completeHandoverUseCase.execute(
      managerUserId,
      bookingId,
      req.body?.notes
    )

    let message = "Vehicle handover completed & booking closed successfully"
    const settlementOutcome = booking.settlementOutcome
    if (settlementOutcome) {
      switch (settlementOutcome.status) {
        case "PROCESSED":
          message = "Handover completed & payout transferred to owner successfully"
          break
        case "HELD":
          message =
            "Handover completed. Payout is on hold: " +
            (settlementOutcome.holdReason || "owner payout account not linked")
          break
        case "FAILED":
          message =
            "Handover completed, but the payout transfer failed: " +
            (settlementOutcome.failureReason || "unknown error")
          break
        case "PROCESSING":
        case "PENDING":
          message = "Handover completed. Payout will be processed shortly"
          break
      }
    }

    success(res, booking, HTTP_STATUS.OK, message)
  }

  stallBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.stallBookingUseCase.execute(managerUserId, {
      bookingId,
      reason: req.body.reason,
    })
    success(res, booking, HTTP_STATUS.OK, "Booking transitioned to STALLED state successfully")
  }

  resolveStalled = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.resolveStalledBookingUseCase.execute(managerUserId, {
      bookingId,
      resolution: req.body.resolution,
      targetStatus: req.body.targetStatus,
    })
    success(res, booking, HTTP_STATUS.OK, "Stalled booking resolved successfully")
  }
}
