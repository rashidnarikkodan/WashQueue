import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Mocked } from "vitest"
import { isStaffAuthorizedForStation } from "../queue-authorization.util"
import { Station } from "@/modules/station/domain/entities/Station"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { ManagerAssignment } from "@/modules/manager/domain/entities/ManagerAssignment"
import { Owner as OwnerModel } from "@/modules/owner/infrastructure/model/owner.model"
import { Types } from "mongoose"

vi.mock("@/modules/owner/infrastructure/model/owner.model", () => ({
  Owner: {
    findOne: vi.fn(),
  },
}))

describe("isStaffAuthorizedForStation", () => {
  let mockAssignmentRepo: Mocked<IManagerAssignmentRepository>
  const ownerRecordId = new Types.ObjectId().toString()
  const ownerUserId = new Types.ObjectId().toString()
  const stationId = new Types.ObjectId().toString()

  const createMockStation = (ownerId: string): Station => {
    return {
      id: stationId,
      ownerId,
      getProps: () => ({
        id: stationId,
        ownerId,
      }),
    } as unknown as Station
  }

  const mockOwnerFindOne = (resolvedOwnerDoc: { _id: Types.ObjectId } | null) => {
    const execMock = vi.fn().mockResolvedValue(resolvedOwnerDoc)
    const leanMock = vi.fn().mockReturnValue({ exec: execMock })
    const selectMock = vi.fn().mockReturnValue({ lean: leanMock })
    vi.mocked(OwnerModel.findOne).mockReturnValue({
      select: selectMock,
    } as unknown as ReturnType<typeof OwnerModel.findOne>)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAssignmentRepo = {
      findByUserAndStation: vi.fn().mockResolvedValue(null),
    } as unknown as Mocked<IManagerAssignmentRepository>
  })

  it("should return false if station or userId is not provided", async () => {
    expect(await isStaffAuthorizedForStation(null as unknown as Station, "user_1")).toBe(false)
    expect(await isStaffAuthorizedForStation(createMockStation("owner_1"), "")).toBe(false)
  })

  it("should return true if station ownerId matches userId directly", async () => {
    const station = createMockStation("direct_owner_id")
    const result = await isStaffAuthorizedForStation(station, "direct_owner_id", mockAssignmentRepo)
    expect(result).toBe(true)
  })

  it("should return true if owner record resolves to station ownerId via OwnerModel", async () => {
    const station = createMockStation(ownerRecordId)
    mockOwnerFindOne({ _id: new Types.ObjectId(ownerRecordId) })

    const result = await isStaffAuthorizedForStation(station, ownerUserId, mockAssignmentRepo)

    expect(OwnerModel.findOne).toHaveBeenCalledWith({ userId: new Types.ObjectId(ownerUserId) })
    expect(result).toBe(true)
  })

  it("should return true if user has an active manager assignment for the station", async () => {
    const station = createMockStation(ownerRecordId)
    mockOwnerFindOne(null)

    mockAssignmentRepo.findByUserAndStation.mockResolvedValue({
      id: "assign_1",
      userId: "manager_user_1",
      stationId,
      status: "ACTIVE",
    } as unknown as ManagerAssignment)

    const result = await isStaffAuthorizedForStation(station, "manager_user_1", mockAssignmentRepo)

    expect(result).toBe(true)
    expect(mockAssignmentRepo.findByUserAndStation).toHaveBeenCalledWith("manager_user_1", stationId)
  })

  it("should return false if user has an inactive manager assignment and is not owner", async () => {
    const station = createMockStation(ownerRecordId)
    mockOwnerFindOne(null)

    mockAssignmentRepo.findByUserAndStation.mockResolvedValue({
      id: "assign_1",
      userId: "manager_user_1",
      stationId,
      status: "INACTIVE",
    } as unknown as ManagerAssignment)

    const result = await isStaffAuthorizedForStation(station, "manager_user_1", mockAssignmentRepo)

    expect(result).toBe(false)
  })

  it("should return false if user is neither owner nor assigned manager", async () => {
    const station = createMockStation(ownerRecordId)
    mockOwnerFindOne(null)

    mockAssignmentRepo.findByUserAndStation.mockResolvedValue(null)

    const result = await isStaffAuthorizedForStation(station, "random_user", mockAssignmentRepo)

    expect(result).toBe(false)
  })
})
