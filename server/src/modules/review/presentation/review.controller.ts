import { Request, Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { AppError } from "@/common/errors/app-error"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import {
  ICreateReviewUseCase,
  IDeleteReviewUseCase,
  IGetReviewByBookingUseCase,
  IGetReviewByIdUseCase,
  IGetStationReviewsUseCase,
  IGetUserReviewsUseCase,
  IUpdateReviewUseCase,
} from "../application/interfaces/review-usecases.interface"

export class ReviewController {
  constructor(
    private readonly createReviewUseCase: ICreateReviewUseCase,
    private readonly updateReviewUseCase: IUpdateReviewUseCase,
    private readonly getReviewByIdUseCase: IGetReviewByIdUseCase,
    private readonly getReviewByBookingUseCase: IGetReviewByBookingUseCase,
    private readonly getStationReviewsUseCase: IGetStationReviewsUseCase,
    private readonly getUserReviewsUseCase: IGetUserReviewsUseCase,
    private readonly deleteReviewUseCase: IDeleteReviewUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.createReviewUseCase.execute(userId, req.body)
    success(res, result, HTTP_STATUS.CREATED, "Review submitted successfully")
  }

  update = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const reviewId = req.params.id as string
    if (!reviewId) {
      throw new AppError("Review ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.updateReviewUseCase.execute(userId, reviewId, req.body)
    success(res, result, HTTP_STATUS.OK, "Review updated successfully")
  }

  getById = async (req: Request, res: Response) => {
    const reviewId = req.params.id as string
    if (!reviewId) {
      throw new AppError("Review ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.getReviewByIdUseCase.execute(reviewId)
    success(res, result, HTTP_STATUS.OK, "Review retrieved successfully")
  }

  getByBooking = async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId as string
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.getReviewByBookingUseCase.execute(bookingId)
    success(res, result, HTTP_STATUS.OK, "Review retrieved successfully")
  }

  getStationReviews = async (req: Request, res: Response) => {
    const stationId = req.params.stationId as string
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const page = req.query.page ? Number(req.query.page) : undefined
    const limit = req.query.limit ? Number(req.query.limit) : undefined

    const result = await this.getStationReviewsUseCase.execute(stationId, { page, limit })
    success(res, result, HTTP_STATUS.OK, "Station reviews retrieved successfully")
  }

  getMyReviews = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const page = req.query.page ? Number(req.query.page) : undefined
    const limit = req.query.limit ? Number(req.query.limit) : undefined

    const result = await this.getUserReviewsUseCase.execute(userId, { page, limit })
    success(res, result, HTTP_STATUS.OK, "User reviews retrieved successfully")
  }

  delete = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const userRole = req.user?.role || ""
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const reviewId = req.params.id as string
    if (!reviewId) {
      throw new AppError("Review ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.deleteReviewUseCase.execute(userId, userRole, reviewId)
    success(res, result, HTTP_STATUS.OK, result.message)
  }
}
