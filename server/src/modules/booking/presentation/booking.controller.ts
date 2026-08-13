import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { AppError } from "@/common/errors/app-error"
import {
  IAdvanceBookingStatusUseCase,
  ICancelBookingUseCase,
  ICheckInBookingUseCase,
  ICreateBookingUseCase,
  ICreateWalkInBookingUseCase,
  IGetBookingUseCase,
  IGetUserBookingsUseCase,
} from "../application/interfaces/booking-usecases.interface"
import { IPDFInvoiceService } from "../application/interfaces/pdf-invoice.interface"

import { getBookingListQuerySchema } from "./schema/booking.schema"
import { BookingStatus } from "../domain/entities/Booking"
import { ValidateQRForCheckInUseCase } from "../application/use-cases/validate-qr.use-case"
import { SavePreInspectionAndCheckInUseCase } from "../application/use-cases/save-pre-inspection.use-case"

import { GetOperationalQueueUseCase } from "../application/use-cases/get-operational-queue.use-case"
import { StartServiceUseCase } from "../application/use-cases/start-service.use-case"
import { SavePostInspectionUseCase } from "../application/use-cases/save-post-inspection.use-case"
import { CompleteHandoverUseCase } from "../application/use-cases/complete-handover.use-case"
import { StallBookingUseCase } from "../application/use-cases/stall-booking.use-case"
import { ResolveStalledBookingUseCase } from "../application/use-cases/resolve-stalled-booking.use-case"

export class BookingController {
  constructor(
    private readonly createBookingUseCase: ICreateBookingUseCase,
    private readonly createWalkInBookingUseCase: ICreateWalkInBookingUseCase,
    private readonly getBookingUseCase: IGetBookingUseCase,
    private readonly getUserBookingsUseCase: IGetUserBookingsUseCase,
    private readonly checkInBookingUseCase: ICheckInBookingUseCase,
    private readonly advanceBookingStatusUseCase: IAdvanceBookingStatusUseCase,
    private readonly cancelBookingUseCase: ICancelBookingUseCase,
    private readonly pdfInvoiceService: IPDFInvoiceService,
    private readonly validateQrUseCase?: ValidateQRForCheckInUseCase,
    private readonly savePreInspectionUseCase?: SavePreInspectionAndCheckInUseCase,
    private readonly getOperationalQueueUseCase?: GetOperationalQueueUseCase,
    private readonly startServiceUseCase?: StartServiceUseCase,
    private readonly savePostInspectionUseCase?: SavePostInspectionUseCase,
    private readonly completeHandoverUseCase?: CompleteHandoverUseCase,
    private readonly stallBookingUseCase?: StallBookingUseCase,
    private readonly resolveStalledBookingUseCase?: ResolveStalledBookingUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const booking = await this.createBookingUseCase.execute(userId, req.body)
    success(res, booking, HTTP_STATUS.CREATED, "Booking created successfully")
  }

  createWalkIn = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const booking = await this.createWalkInBookingUseCase.execute(managerUserId, req.body)
    success(res, booking, HTTP_STATUS.CREATED, "Walk-in booking created successfully")
  }

  getById = async (req: AuthenticatedRequest, res: Response) => {
    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const booking = await this.getBookingUseCase.execute(bookingId, req.user?.userId)
    success(res, booking, HTTP_STATUS.OK, "Booking retrieved successfully")
  }

  getUserBookings = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const role = req.user?.role
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const query = getBookingListQuerySchema.parse(req.query)
    const search = query.q || query.search
    const result = await this.getUserBookingsUseCase.execute(
      userId,
      {
        ...query,
        search,
        status: query.status ? (query.status as BookingStatus) : undefined,
      },
      role
    )
    success(res, result, HTTP_STATUS.OK, "User bookings retrieved successfully")
  }

  getUpcoming = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const role = req.user?.role
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const query = getBookingListQuerySchema.parse(req.query)
    const result = await this.getUserBookingsUseCase.execute(
      userId,
      { ...query, type: "upcoming" },
      role
    )
    success(res, result, HTTP_STATUS.OK, "Upcoming bookings retrieved successfully")
  }

  getHistory = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const role = req.user?.role
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const query = getBookingListQuerySchema.parse(req.query)
    const result = await this.getUserBookingsUseCase.execute(
      userId,
      { ...query, type: "history" },
      role
    )
    success(res, result, HTTP_STATUS.OK, "Booking history retrieved successfully")
  }

  validateQr = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    if (!this.validateQrUseCase) {
      throw new AppError("QR validation service unavailable", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const booking = await this.validateQrUseCase.execute(managerUserId, req.body)
    success(res, booking, HTTP_STATUS.OK, "QR Code validated successfully")
  }

  submitPreInspection = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!this.savePreInspectionUseCase) {
      throw new AppError("Inspection service unavailable", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const booking = await this.savePreInspectionUseCase.execute(managerUserId, {
      bookingId,
      ...req.body,
    })
    success(res, booking, HTTP_STATUS.OK, "Pre-service inspection completed and vehicle checked in")
  }

  submitPostInspection = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!this.savePostInspectionUseCase) {
      throw new AppError("Post-inspection service unavailable", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const booking = await this.savePostInspectionUseCase.execute(managerUserId, {
      bookingId,
      ...req.body,
    })
    success(res, booking, HTTP_STATUS.OK, "Post-service inspection completed successfully")
  }

  completeHandover = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!this.completeHandoverUseCase) {
      throw new AppError("Handover service unavailable", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const booking = await this.completeHandoverUseCase.execute(managerUserId, bookingId, req.body?.notes)
    success(res, booking, HTTP_STATUS.OK, "Vehicle handover completed & booking closed successfully")
  }

  startService = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!this.startServiceUseCase) {
      throw new AppError("Start service execution unavailable", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const booking = await this.startServiceUseCase.execute(managerUserId, bookingId)
    success(res, booking, HTTP_STATUS.OK, "Wash service started successfully")
  }

  getLiveQueue = async (req: AuthenticatedRequest, res: Response) => {
    const stationId = (req.query.stationId || req.params.stationId) as string
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!this.getOperationalQueueUseCase) {
      throw new AppError("Operational queue service unavailable", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const queueData = await this.getOperationalQueueUseCase.execute(stationId)
    success(res, queueData, HTTP_STATUS.OK, "Operational queue retrieved successfully")
  }

  checkIn = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const booking = await this.checkInBookingUseCase.execute(managerUserId, req.body)
    success(res, booking, HTTP_STATUS.OK, "Booking checked in successfully")
  }

  advanceStatus = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const booking = await this.advanceBookingStatusUseCase.execute(managerUserId, {
      bookingId,
      ...req.body,
    })
    success(res, booking, HTTP_STATUS.OK, "Booking status updated successfully")
  }

  cancel = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const role = req.user?.role
    const booking = await this.cancelBookingUseCase.execute(
      userId,
      {
        bookingId,
        reason: req.body.reason,
      },
      role
    )
    success(res, booking, HTTP_STATUS.OK, "Booking cancelled successfully")
  }

  downloadInvoice = async (req: AuthenticatedRequest, res: Response) => {
    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const booking = await this.getBookingUseCase.execute(bookingId, req.user?.userId)
    const pdfBuffer = await this.pdfInvoiceService.generateInvoicePdf(booking)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${booking.bookingNumber}.pdf`
    )
    res.setHeader("Content-Length", pdfBuffer.length)
    res.status(200).send(pdfBuffer)
  }

  stallBooking = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!this.stallBookingUseCase) {
      throw new AppError("Stall booking service unavailable", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const booking = await this.stallBookingUseCase.execute(managerUserId, {
      bookingId,
      reason: req.body.reason,
    })
    success(res, booking, HTTP_STATUS.OK, "Booking transitioned to STALLED state successfully")
  }

  resolveStalled = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!this.resolveStalledBookingUseCase) {
      throw new AppError("Resolve stalled booking service unavailable", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const booking = await this.resolveStalledBookingUseCase.execute(managerUserId, {
      bookingId,
      resolution: req.body.resolution,
      targetStatus: req.body.targetStatus,
    })
    success(res, booking, HTTP_STATUS.OK, "Stalled booking resolved successfully")
  }
}
