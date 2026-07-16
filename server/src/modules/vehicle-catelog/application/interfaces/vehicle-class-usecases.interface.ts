import { ClassResponseDto, CreateClassInput, UpdateClassInput } from "../dtos/class.dto"

export interface ICreateClassUseCase {
  execute(input: CreateClassInput): Promise<ClassResponseDto>
}

export interface IGetClassUseCase {
  execute(id: string): Promise<ClassResponseDto | null>
}

export interface IGetClassesUseCase {
  execute(filter?: { categoryId?: string }): Promise<ClassResponseDto[]>
}

export interface IUpdateClassUseCase {
  execute(id: string, updates: UpdateClassInput): Promise<ClassResponseDto | null>
}

export interface IDeleteClassUseCase {
  execute(id: string): Promise<void>
}
