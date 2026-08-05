import { ManagerInvitation } from "../entities/ManagerInvitation"

export interface IManagerInvitationRepository {
  create(invitation: ManagerInvitation): Promise<ManagerInvitation>
  findById(id: string): Promise<ManagerInvitation | null>
  findByToken(token: string): Promise<ManagerInvitation | null>
  findByEmailAndStation(email: string, stationId: string): Promise<ManagerInvitation | null>
  findPendingByEmail(email: string): Promise<ManagerInvitation | null>
  findByOwnerId(ownerId: string): Promise<ManagerInvitation[]>
  findByStationId(stationId: string): Promise<ManagerInvitation[]>
  update(invitation: ManagerInvitation): Promise<ManagerInvitation>
}
