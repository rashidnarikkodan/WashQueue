import { Owner } from "../../domain/entities/Owner"
import { CreateOwnerInput } from "../dto/create-owner.dto"
import { UpdateOwnerInput } from "../dto/update-owner.dto"

export interface ICreateOwnerUseCase {
  execute(input: CreateOwnerInput): Promise<Owner>
}

export interface IGetOwnerUseCase {
  execute(userId: string): Promise<Owner | null>
}

export interface IUpdateOwnerUseCase {
  execute(userId: string, input: UpdateOwnerInput): Promise<Owner | null>
}
