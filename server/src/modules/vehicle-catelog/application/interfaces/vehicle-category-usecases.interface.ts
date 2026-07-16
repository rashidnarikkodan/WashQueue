import { CategoryResponseDto, CreateCategoryInput, UpdateCategoryInput } from "../dtos/category.dto"

export interface ICreateCategoryUseCase {
  execute(input: CreateCategoryInput): Promise<CategoryResponseDto>
}

export interface IGetCategoryUseCase {
  execute(id: string): Promise<CategoryResponseDto | null>
}

export interface IGetCategoriesUseCase {
  execute(): Promise<CategoryResponseDto[]>
}

export interface IUpdateCategoryUseCase {
  execute(id: string, updates: UpdateCategoryInput): Promise<CategoryResponseDto | null>
}

export interface IDeleteCategoryUseCase {
  execute(id: string): Promise<void>
}
