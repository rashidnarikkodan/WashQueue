import { ClientSession } from "mongoose"
import { ExtraService } from "../entities/ExtraService"
import { ExtraServiceProps } from "../entities/ExtraService"

export interface IExtraServiceRepository {
  findByStationId(stationId: string, session?: ClientSession): Promise<ExtraService[]>

  save(props: Omit<ExtraServiceProps, "id" | "createdAt" | "updatedAt">, session?: ClientSession): Promise<ExtraService>

  update(
    id: string,
    data: Partial<Pick<ExtraServiceProps, "name" | "description" | "pricing" | "isActive">>,
    session?: ClientSession
  ): Promise<ExtraService | null>

  delete(id: string, session?: ClientSession): Promise<void>

  deleteByStationId(stationId: string, session?: ClientSession): Promise<void>
}
