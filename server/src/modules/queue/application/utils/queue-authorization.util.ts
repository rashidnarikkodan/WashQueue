import { Station } from "@/modules/station/domain/entities/Station"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { Owner as OwnerModel } from "@/modules/owner/infrastructure/model/owner.model"
import { Types } from "mongoose"

export async function isStaffAuthorizedForStation(
  station: Station,
  userId: string,
  managerAssignmentRepository?: IManagerAssignmentRepository
): Promise<boolean> {
  if (!station || !userId) return false

  const stationOwnerId = station.ownerId || station.getProps().ownerId
  if (stationOwnerId && stationOwnerId.toString() === userId.toString()) {
    return true
  }

  try {
    if (Types.ObjectId.isValid(userId)) {
      const ownerDoc = await OwnerModel.findOne({
        userId: new Types.ObjectId(userId),
      })
        .select("_id")
        .lean()
        .exec()

      if (ownerDoc && stationOwnerId && stationOwnerId.toString() === ownerDoc._id.toString()) {
        return true
      }
    }
  } catch (err) {
    console.error("Failed to check owner authorization for station:", err)
  }

  if (managerAssignmentRepository) {
    const assignment = await managerAssignmentRepository.findByUserAndStation(userId, station.id)
    if (assignment && assignment.status === "ACTIVE") {
      return true
    }
  }

  return false
}
