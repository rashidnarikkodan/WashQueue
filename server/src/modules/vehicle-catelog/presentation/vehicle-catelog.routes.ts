import { Router } from "express"
import { VehicleCatelogController } from "./vehicle-catelog.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { ROLE } from "@/common/constants/role.constants"
import { API_ROUTES } from "@/common/constants/route.constants"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { createCategorySchema, updateCategorySchema } from "./schema/category.schema"
import { createClassSchema, updateClassSchema } from "./schema/class.schema"

export const createVehicleCatelogRouter = (
  vehicleCatelogController: VehicleCatelogController
): Router => {
  const router = Router()

  router.get(
    API_ROUTES.VEHICLE_CATALOG.CATEGORIES,
    asyncHandler(vehicleCatelogController.getCategories)
  )
  router.get(
    API_ROUTES.VEHICLE_CATALOG.CATEGORY_BY_ID,
    asyncHandler(vehicleCatelogController.getCategory)
  )

  router.post(
    API_ROUTES.VEHICLE_CATALOG.CATEGORIES,
    authenticate,
    authorize(ROLE.ADMIN),
    validateRequest(createCategorySchema),
    asyncHandler(vehicleCatelogController.createCategory)
  )
  router.patch(
    API_ROUTES.VEHICLE_CATALOG.CATEGORY_BY_ID,
    authenticate,
    authorize(ROLE.ADMIN),
    validateRequest(updateCategorySchema),
    asyncHandler(vehicleCatelogController.updateCategory)
  )
  router.delete(
    API_ROUTES.VEHICLE_CATALOG.CATEGORY_BY_ID,
    authenticate,
    authorize(ROLE.ADMIN),
    asyncHandler(vehicleCatelogController.deleteCategory)
  )

  router.get(API_ROUTES.VEHICLE_CATALOG.CLASSES, asyncHandler(vehicleCatelogController.getClasses))
  router.get(
    API_ROUTES.VEHICLE_CATALOG.CLASS_BY_ID,
    asyncHandler(vehicleCatelogController.getClass)
  )

  router.post(
    API_ROUTES.VEHICLE_CATALOG.CLASSES,
    authenticate,
    authorize(ROLE.ADMIN),
    validateRequest(createClassSchema),
    asyncHandler(vehicleCatelogController.createClass)
  )
  router.put(
    API_ROUTES.VEHICLE_CATALOG.CLASS_BY_ID,
    authenticate,
    authorize(ROLE.ADMIN),
    validateRequest(updateClassSchema),
    asyncHandler(vehicleCatelogController.updateClass)
  )
  router.delete(
    API_ROUTES.VEHICLE_CATALOG.CLASS_BY_ID,
    authenticate,
    authorize(ROLE.ADMIN),
    asyncHandler(vehicleCatelogController.deleteClass)
  )

  return router
}
