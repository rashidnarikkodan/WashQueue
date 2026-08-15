import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import {
  ICancelBookingUseCase,
  ICheckInBookingUseCase,
  ICompleteHandoverUseCase,
  ICreateBookingUseCase,
  ICreateWalkInBookingUseCase,
  IGetBookingUseCase,
  IGetOperationalQueueUseCase,
  IGetUserBookingsUseCase,
  IResolveStalledBookingUseCase,
  ISavePostInspectionUseCase,
  ISavePreInspectionAndCheckInUseCase,
  IStartServiceUseCase,
  IStallBookingUseCase,
  IValidateQRForCheckInUseCase,
} from "../application/interfaces/booking-usecases.interface"
import { IPDFInvoiceService } from "../application/interfaces/pdf-invoice.interface"
import { getBookingListQuerySchema } from "./schema/booking.schema"
import { BookingStatus } from "../domain/entities/Booking"

export class BookingController {
  constructor(
    private readonly createBookingUseCase: ICreateBookingUseCase,
    private readonly createWalkInBookingUseCase: ICreateWalkInBookingUseCase,
    private readonly getBookingUseCase: IGetBookingUseCase,
    private readonly getUserBookingsUseCase: IGetUserBookingsUseCase,
    private readonly checkInBookingUseCase: ICheckInBookingUseCase,
    private readonly cancelBookingUseCase: ICancelBookingUseCase,
    private readonly pdfInvoiceService: IPDFInvoiceService,
    private readonly validateQrUseCase: IValidateQRForCheckInUseCase,
    private readonly savePreInspectionUseCase: ISavePreInspectionAndCheckInUseCase,
    private readonly getOperationalQueueUseCase: IGetOperationalQueueUseCase,
    private readonly startServiceUseCase: IStartServiceUseCase,
    private readonly savePostInspectionUseCase: ISavePostInspectionUseCase,
    private readonly completeHandoverUseCase: ICompleteHandoverUseCase,
    private readonly stallBookingUseCase: IStallBookingUseCase,
    private readonly resolveStalledBookingUseCase: IResolveStalledBookingUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const booking = await this.createBookingUseCase.execute(userId, req.body)
    success(res, booking, HTTP_STATUS.CREATED, "Booking created successfully")
  }

  createWalkIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const booking = await this.createWalkInBookingUseCase.execute(managerUserId, req.body)
    success(res, booking, HTTP_STATUS.CREATED, "Walk-in booking created successfully")
  }

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.getBookingUseCase.execute(bookingId, req.user?.userId)
    success(res, booking, HTTP_STATUS.OK, "Booking retrieved successfully")
  }

  getUserBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  getUpcoming = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  getHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  cancel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params as { bookingId: string }
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

  downloadInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.getBookingUseCase.execute(bookingId, req.user?.userId)
    const pdfBuffer = await this.pdfInvoiceService.generateInvoicePdf(booking)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${booking.bookingNumber}.pdf`
    )
    res.setHeader("Content-Length", pdfBuffer.length)
    res.status(HTTP_STATUS.OK).send(pdfBuffer)
  }

  getOperationalQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { stationId } = req.params as { stationId: string }
    const queueData = await this.getOperationalQueueUseCase.execute(stationId)
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

  checkIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerUserId = req.user?.userId
    if (!managerUserId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const booking = await this.checkInBookingUseCase.execute(managerUserId, req.body)
    success(res, booking, HTTP_STATUS.OK, "Booking checked in successfully")
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
    success(res, booking, HTTP_STATUS.OK, "Vehicle handover completed & booking closed successfully")
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
