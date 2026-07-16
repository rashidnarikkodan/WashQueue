import { Request, Response } from "express"
import {
  ICreateCategoryUseCase,
  IGetCategoryUseCase,
  IGetCategoriesUseCase,
  IUpdateCategoryUseCase,
  IDeleteCategoryUseCase,
} from "../application/interfaces/vehicle-category-usecases.interface"
import {
  ICreateClassUseCase,
  IGetClassUseCase,
  IGetClassesUseCase,
  IUpdateClassUseCase,
  IDeleteClassUseCase,
} from "../application/interfaces/vehicle-class-usecases.interface"
import { getClassesQuerySchema } from "./schema/class.schema"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { SUCCESS_MESSAGES } from "@/common/constants/app.constants"
import { NotFoundError } from "@/common/errors/not-found-error"

export class VehicleCatelogController {
  constructor(
    private readonly createCategoryUseCase: ICreateCategoryUseCase,
    private readonly getCategoryUseCase: IGetCategoryUseCase,
    private readonly getCategoriesUseCase: IGetCategoriesUseCase,
    private readonly updateCategoryUseCase: IUpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: IDeleteCategoryUseCase,
    private readonly createClassUseCase: ICreateClassUseCase,
    private readonly getClassUseCase: IGetClassUseCase,
    private readonly getClassesUseCase: IGetClassesUseCase,
    private readonly updateClassUseCase: IUpdateClassUseCase,
    private readonly deleteClassUseCase: IDeleteClassUseCase
  ) {}

  // --- Category Handlers ---

  createCategory = async (req: Request, res: Response): Promise<void> => {
    const category = await this.createCategoryUseCase.execute(req.body)
    success(res, category, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.CATEGORY_CREATED_SUCCESS)
  }

  getCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    if (!id) throw new NotFoundError("Category ID is required")
    const category = await this.getCategoryUseCase.execute(id)
    success(res, category, HTTP_STATUS.OK, SUCCESS_MESSAGES.CATEGORY_RETRIEVED_SUCCESS)
  }

  getCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await this.getCategoriesUseCase.execute()
    success(res, categories, HTTP_STATUS.OK, SUCCESS_MESSAGES.CATEGORIES_RETRIEVED_SUCCESS)
  }

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    if (!id) throw new NotFoundError("Category ID is required")
    const category = await this.updateCategoryUseCase.execute(id, req.body)
    success(res, category, HTTP_STATUS.OK, SUCCESS_MESSAGES.CATEGORY_UPDATED_SUCCESS)
  }

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    if (!id) throw new NotFoundError("Category ID is required")
    await this.deleteCategoryUseCase.execute(id)
    success(res, null, HTTP_STATUS.OK, SUCCESS_MESSAGES.CATEGORY_DELETED_SUCCESS)
  }

  // --- Class Handlers ---

  createClass = async (req: Request, res: Response): Promise<void> => {
    const vehicleClass = await this.createClassUseCase.execute(req.body)
    success(res, vehicleClass, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.CLASS_CREATED_SUCCESS)
  }

  getClass = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    if (!id) throw new NotFoundError("Class ID is required")
    const vehicleClass = await this.getClassUseCase.execute(id)
    success(res, vehicleClass, HTTP_STATUS.OK, SUCCESS_MESSAGES.CLASS_RETRIEVED_SUCCESS)
  }

  getClasses = async (req: Request, res: Response): Promise<void> => {
    const query = getClassesQuerySchema.parse(req.query)
    const classes = await this.getClassesUseCase.execute(query)
    success(res, classes, HTTP_STATUS.OK, SUCCESS_MESSAGES.CLASSES_RETRIEVED_SUCCESS)
  }

  updateClass = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    if (!id) throw new NotFoundError("Class ID is required")
    const vehicleClass = await this.updateClassUseCase.execute(id, req.body)
    success(res, vehicleClass, HTTP_STATUS.OK, SUCCESS_MESSAGES.CLASS_UPDATED_SUCCESS)
  }

  deleteClass = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    if (!id) throw new NotFoundError("Class ID is required")
    await this.deleteClassUseCase.execute(id)
    success(res, null, HTTP_STATUS.OK, SUCCESS_MESSAGES.CLASS_DELETED_SUCCESS)
  }
}
