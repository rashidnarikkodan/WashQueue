import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"

export interface IStationStepParser<T> {
  supports(step: number): boolean
  parse(req: AuthenticatedRequest): Promise<T> | T
}
