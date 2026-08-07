import { ExtraService } from "../entities/ExtraService"
import { ExtraServiceProps } from "../entities/ExtraService"

export interface IExtraServiceRepository {
  findByStationId(stationId: string, session?: unknown): Promise<ExtraService[]>

  save(props: Omit<ExtraServiceProps, "id" | "createdAt" | "updatedAt">, session?: unknown): Promise<ExtraService>

  update(
    id: string,
    data: Partial<Pick<ExtraServiceProps, "name" | "slug" | "description" | "pricing" | "isActive">>,
    session?: unknown
  ): Promise<ExtraService | null>

  delete(id: string, session?: unknown): Promise<void>

  deleteByStationId(stationId: string, session?: unknown): Promise<void>
}
