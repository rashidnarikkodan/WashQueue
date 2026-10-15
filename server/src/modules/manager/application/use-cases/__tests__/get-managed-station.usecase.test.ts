import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Mocked } from "vitest"
import { GetManagedStationUseCase } from "../get-managed-station.usecase"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { Station } from "@/modules/station/domain/entities/Station"
import {
  ManagerAssignment,
  ManagerPermission,
} from "@/modules/manager/domain/entities/ManagerAssignment"

describe("GetManagedStationUseCase", () => {
  let managerAssignmentRepository: Mocked<IManagerAssignmentRepository>
  let stationRepository: Mocked<IStationRepository>
  let useCase: GetManagedStationUseCase

  const createMockStation = (id: string, name: string): Station => {
    return {
      id,
      getProps: () => ({
        id,
        name,
        ownerId: "owner_123",
        address: { street: "Main St", city: "Metropolis" },
      }),
    } as unknown as Station
  }

  beforeEach(() => {
    vi.clearAllMocks()
    managerAssignmentRepository = {
      findByUserId: vi.fn(),
    } as unknown as Mocked<IManagerAssignmentRepository>
    stationRepository = {
      findById: vi.fn(),
      findByManagerId: vi.fn(),
      findByOwnerId: vi.fn(),
    } as unknown as Mocked<IStationRepository>
    useCase = new GetManagedStationUseCase(managerAssignmentRepository, stationRepository)
  })

  it("should return assigned stations when user has manager assignments", async () => {
    const mockStation = createMockStation("station_1", "Assignment Station")
    managerAssignmentRepository.findByUserId.mockResolvedValue([
      {
        id: "assignment_1",
        userId: "user_1",
        stationId: "station_1",
        permissions: [ManagerPermission.QUEUE_MANAGEMENT],
        status: "ACTIVE",
      } as unknown as ManagerAssignment,
    ])
    stationRepository.findById.mockResolvedValue(mockStation)

    const result = await useCase.execute("user_1")

    expect(result).toHaveLength(1)
    expect(result[0]!.stationId).toBe("station_1")
    expect(result[0]!.stationName).toBe("Assignment Station")
    expect(result[0]!.permissions).toEqual([ManagerPermission.QUEUE_MANAGEMENT])
  })

  it("should fall back to findByManagerId if no manager assignments found", async () => {
    const mockStation = createMockStation("station_2", "Manager Station")
    managerAssignmentRepository.findByUserId.mockResolvedValue([])
    stationRepository.findByManagerId.mockResolvedValue([mockStation])

    const result = await useCase.execute("user_manager")

    expect(result).toHaveLength(1)
    expect(result[0]!.stationId).toBe("station_2")
    expect(result[0]!.stationName).toBe("Manager Station")
    expect(result[0]!.permissions).toContain(ManagerPermission.QUEUE_MANAGEMENT)
  })

  it("should fall back to findByOwnerId if user is station owner without separate manager role", async () => {
    const mockStation = createMockStation("station_3", "Owner Station")
    managerAssignmentRepository.findByUserId.mockResolvedValue([])
    stationRepository.findByManagerId.mockResolvedValue([])
    stationRepository.findByOwnerId.mockResolvedValue([mockStation])

    const result = await useCase.execute("owner_user_id")

    expect(result).toHaveLength(1)
    expect(result[0]!.stationId).toBe("station_3")
    expect(result[0]!.stationName).toBe("Owner Station")
    expect(result[0]!.permissions).toEqual([
      ManagerPermission.BOOKING_MANAGEMENT,
      ManagerPermission.QUEUE_MANAGEMENT,
      ManagerPermission.CUSTOMER_MANAGEMENT,
      ManagerPermission.PRICING_MANAGEMENT,
      ManagerPermission.REPORTS_VIEW,
      ManagerPermission.STATION_SETTINGS,
    ])
    expect(result[0]!.status).toBe("ACTIVE")
    expect(stationRepository.findByOwnerId).toHaveBeenCalledWith("owner_user_id")
  })
})
