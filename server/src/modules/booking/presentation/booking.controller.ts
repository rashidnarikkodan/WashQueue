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

export class BookingController {
  constructor(
    private readonly createBookingUseCase: ICreateBookingUseCase,
    private readonly createWalkInBookingUseCase: ICreateWalkInBookingUseCase,
    private readonly getBookingUseCase: IGetBookingUseCase,
    private readonly getUserBookingsUseCase: IGetUserBookingsUseCase,
    private readonly checkInBookingUseCase: ICheckInBookingUseCase,
    private readonly advanceBookingStatusUseCase: IAdvanceBookingStatusUseCase,
    private readonly cancelBookingUseCase: ICancelBookingUseCase,
    private readonly pdfInvoiceService: IPDFInvoiceService
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

    const type = (req.query.type as "upcoming" | "history" | "all") || "all"
    const bookings = await this.getUserBookingsUseCase.execute(userId, type, role)
    success(res, bookings, HTTP_STATUS.OK, "User bookings retrieved successfully")
  }

  getUpcoming = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const role = req.user?.role
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const bookings = await this.getUserBookingsUseCase.execute(userId, "upcoming", role)
    success(res, bookings, HTTP_STATUS.OK, "Upcoming bookings retrieved successfully")
  }

  getHistory = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const role = req.user?.role
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const bookings = await this.getUserBookingsUseCase.execute(userId, "history", role)
    success(res, bookings, HTTP_STATUS.OK, "Booking history retrieved successfully")
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

    const booking = await this.cancelBookingUseCase.execute(userId, {
      bookingId,
      reason: req.body.reason,
    })
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
}
