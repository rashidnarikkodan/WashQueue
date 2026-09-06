import { Router } from "express"
import { ReviewController } from "./review.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import {
  createReviewSchema,
  getReviewsQuerySchema,
  updateReviewSchema,
} from "./schema/review.schema"
import { API_ROUTES } from "@/common/constants/route.constants"

export const createReviewRouter = (reviewController: ReviewController): Router => {
  const router = Router()

  // Public routes
  router.get(
    API_ROUTES.REVIEWS.BY_STATION,
    validateRequest(getReviewsQuerySchema, "query"),
    asyncHandler(reviewController.getStationReviews)
  )

  router.get(API_ROUTES.REVIEWS.BY_BOOKING, asyncHandler(reviewController.getByBooking))

  router.get(API_ROUTES.REVIEWS.BY_ID, asyncHandler(reviewController.getById))

  // Authenticated routes
  router.get(
    API_ROUTES.REVIEWS.MY_REVIEWS,
    authenticate,
    validateRequest(getReviewsQuerySchema, "query"),
    asyncHandler(reviewController.getMyReviews)
  )

  router.post(
    API_ROUTES.REVIEWS.CREATE,
    authenticate,
    validateRequest(createReviewSchema, "body"),
    asyncHandler(reviewController.create)
  )

  router.put(
    API_ROUTES.REVIEWS.BY_ID,
    authenticate,
    validateRequest(updateReviewSchema, "body"),
    asyncHandler(reviewController.update)
  )

  router.delete(API_ROUTES.REVIEWS.BY_ID, authenticate, asyncHandler(reviewController.delete))

  return router
}
