import { Owner } from "../entities/Owner"

export interface IOwnerRepository {
  findByUserId(userId: string): Promise<Owner | null>
  save(owner: Owner): Promise<Owner>
}
