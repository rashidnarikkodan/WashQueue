import { Router } from "express"
import { ReviewController } from "./review.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import {
  createReviewSchema,
  getReviewsQuerySchema,
  updateReviewSchema,
} from "./schema/review.schema"
import { API_ROUTES } from "@/common/constants/route.constants"
import { ROLE } from "@/common/constants/role.constants"

export const createReviewRouter = (reviewController: ReviewController): Router => {
  const router = Router()

  // Public routes
  router.get(
    API_ROUTES.REVIEWS.BY_STATION,
    validateRequest(getReviewsQuerySchema, "query"),
    asyncHandler(reviewController.getStationReviews)
  )

  router.get(API_ROUTES.REVIEWS.BY_BOOKING, asyncHandler(reviewController.getByBooking))

  // Admin moderation routes (must be placed before generic /:id)
  router.get(
    API_ROUTES.REVIEWS.ADMIN_MODERATION,
    authenticate,
    authorize(ROLE.ADMIN),
    asyncHandler(reviewController.getAdminModeration)
  )

  router.patch(
    API_ROUTES.REVIEWS.TOGGLE_VISIBILITY,
    authenticate,
    authorize(ROLE.ADMIN),
    asyncHandler(reviewController.toggleVisibility)
  )

  router.patch(
    API_ROUTES.REVIEWS.DISMISS_REPORTS,
    authenticate,
    authorize(ROLE.ADMIN),
    asyncHandler(reviewController.dismissReports)
  )

  // Provider feedback routes (Owner / Manager)
  router.get(
    API_ROUTES.REVIEWS.PROVIDER_FEEDBACK,
    authenticate,
    authorize(ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN),
    asyncHandler(reviewController.getProviderFeedback)
  )

  router.post(API_ROUTES.REVIEWS.REPORT, authenticate, asyncHandler(reviewController.report))

  router.get(API_ROUTES.REVIEWS.BY_ID, asyncHandler(reviewController.getById))

  // Authenticated customer routes
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
