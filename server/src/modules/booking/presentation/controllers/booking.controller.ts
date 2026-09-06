import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import {
  ICancelBookingUseCase,
  IRescheduleBookingUseCase,
  ICreateBookingUseCase,
  ICreateWalkInBookingUseCase,
  IGetBookingUseCase,
  IGetUserBookingsUseCase,
} from "../../application/interfaces/booking-usecases.interface"
import { getBookingListQuerySchema } from "../schema/booking.schema"
import { BookingStatus } from "../../domain/entities/Booking"

export class BookingController {
  constructor(
    private readonly createBookingUseCase: ICreateBookingUseCase,
    private readonly createWalkInBookingUseCase: ICreateWalkInBookingUseCase,
    private readonly getBookingUseCase: IGetBookingUseCase,
    private readonly getUserBookingsUseCase: IGetUserBookingsUseCase,
    private readonly cancelBookingUseCase: ICancelBookingUseCase,
    private readonly rescheduleBookingUseCase: IRescheduleBookingUseCase
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
      role,
      query.mine
    )
    success(res, result, HTTP_STATUS.OK, "User bookings retrieved successfully")
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

  reschedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { bookingId } = req.params as { bookingId: string }
    const { newTimeWindowId } = req.body as { newTimeWindowId: string }
    const role = req.user?.role
    const booking = await this.rescheduleBookingUseCase.execute(
      userId,
      {
        bookingId,
        newTimeWindowId,
      },
      role
    )
    success(res, booking, HTTP_STATUS.OK, "Booking rescheduled successfully")
  }
}
