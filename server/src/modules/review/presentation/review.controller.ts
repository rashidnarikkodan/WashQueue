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
  IDismissReviewReportsUseCase,
  IGetAdminModerationReviewsUseCase,
  IGetProviderFeedbackUseCase,
  IGetReviewByBookingUseCase,
  IGetReviewByIdUseCase,
  IGetStationReviewsUseCase,
  IGetUserReviewsUseCase,
  IReportReviewUseCase,
  IToggleReviewVisibilityUseCase,
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
    private readonly deleteReviewUseCase: IDeleteReviewUseCase,
    private readonly getAdminModerationReviewsUseCase?: IGetAdminModerationReviewsUseCase,
    private readonly toggleReviewVisibilityUseCase?: IToggleReviewVisibilityUseCase,
    private readonly reportReviewUseCase?: IReportReviewUseCase,
    private readonly dismissReviewReportsUseCase?: IDismissReviewReportsUseCase,
    private readonly getProviderFeedbackUseCase?: IGetProviderFeedbackUseCase
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
    const sortBy = req.query.sortBy as string | undefined

    const result = await this.getStationReviewsUseCase.execute(stationId, { page, limit, sortBy })
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

  getAdminModeration = async (req: AuthenticatedRequest, res: Response) => {
    if (!this.getAdminModerationReviewsUseCase) {
      throw new AppError(
        "Admin moderation use case not configured",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    const page = req.query.page ? Number(req.query.page) : undefined
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    const rating = req.query.rating ? Number(req.query.rating) : undefined
    const search = req.query.search as string | undefined
    const stationSearch = req.query.stationSearch as string | undefined
    const stationId = req.query.stationId as string | undefined
    const flaggedOnly = req.query.flaggedOnly === "true"
    const sortBy = req.query.sortBy as string | undefined
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

    const result = await this.getAdminModerationReviewsUseCase.execute({
      page,
      limit,
      rating,
      search,
      stationSearch,
      stationId,
      flaggedOnly,
      sortBy,
      startDate,
      endDate,
    })

    success(res, result, HTTP_STATUS.OK, "Admin moderation reviews retrieved successfully")
  }

  toggleVisibility = async (req: AuthenticatedRequest, res: Response) => {
    if (!this.toggleReviewVisibilityUseCase) {
      throw new AppError(
        "Toggle visibility use case not configured",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    const reviewId = req.params.id as string
    if (!reviewId) {
      throw new AppError("Review ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const isVisible = req.body.isVisible !== undefined ? Boolean(req.body.isVisible) : true
    const result = await this.toggleReviewVisibilityUseCase.execute(reviewId, { isVisible })

    success(
      res,
      result,
      HTTP_STATUS.OK,
      `Review visibility updated to ${isVisible ? "visible" : "hidden"}`
    )
  }

  report = async (req: AuthenticatedRequest, res: Response) => {
    if (!this.reportReviewUseCase) {
      throw new AppError("Report review use case not configured", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const reviewId = req.params.id as string
    if (!reviewId) {
      throw new AppError("Review ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const reason = req.body.reason || "USER_FLAGGED"
    const result = await this.reportReviewUseCase.execute(reviewId, { reason })

    success(res, result, HTTP_STATUS.OK, "Review reported successfully")
  }

  dismissReports = async (req: AuthenticatedRequest, res: Response) => {
    if (!this.dismissReviewReportsUseCase) {
      throw new AppError(
        "Dismiss reports use case not configured",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    const reviewId = req.params.id as string
    if (!reviewId) {
      throw new AppError("Review ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.dismissReviewReportsUseCase.execute(reviewId)
    success(res, result, HTTP_STATUS.OK, "Review reports dismissed successfully")
  }

  getProviderFeedback = async (req: AuthenticatedRequest, res: Response) => {
    if (!this.getProviderFeedbackUseCase) {
      throw new AppError(
        "Provider feedback use case not configured",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    const userId = req.user?.userId
    const userRole = req.user?.role || ""
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const page = req.query.page ? Number(req.query.page) : undefined
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    const rating = req.query.rating ? Number(req.query.rating) : undefined
    const pillFilter = req.query.pillFilter as string | undefined
    const stationId = req.query.stationId as string | undefined
    const search = req.query.search as string | undefined
    const sortBy = req.query.sortBy as string | undefined

    const result = await this.getProviderFeedbackUseCase.execute({
      userId,
      userRole,
      page,
      limit,
      rating,
      pillFilter,
      stationId,
      search,
      sortBy,
    })

    success(res, result, HTTP_STATUS.OK, "Provider feedback reviews retrieved successfully")
  }
}
