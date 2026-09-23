import { describe, it, expect, vi, beforeEach } from "vitest"
import { Issue } from "../domain/entities/Issue"
import { IssueStatus } from "../domain/value-objects/issue-status.vo"
import { ResolutionType } from "../domain/value-objects/resolution-type.vo"
import { IIssueRepository } from "../domain/repositories/issue.repository.interface"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"
import { CreateIssueUseCase } from "../application/use-cases/create-issue.use-case"
import { ResolveIssueUseCase } from "../application/use-cases/resolve-issue.use-case"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { Booking } from "@/modules/booking/domain/entities/Booking"

describe("Issue Module Unit Tests", () => {
  let mockIssueRepo: IIssueRepository
  let mockBookingRepo: IBookingRepository
  let mockNotificationDispatcher: INotificationDispatcherService

  beforeEach(() => {
    mockIssueRepo = {
      save: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByBookingId: vi.fn(),
      findByCustomerId: vi.fn(),
      findByStationId: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      countByStation: vi.fn(),
    }

    mockBookingRepo = {
      findById: vi.fn(),
      findByBookingNumber: vi.fn(),
      findByQrTokenHash: vi.fn(),
      findByUserId: vi.fn(),
      findByStationId: vi.fn(),
      findBookings: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      updateWithStatusGuard: vi.fn(),
      countByStationAndStatus: vi.fn(),
      findNoShowCandidates: vi.fn(),
      getRefundDetails: vi.fn(),
      applyRefund: vi.fn(),
    }

    mockNotificationDispatcher = {
      dispatch: vi.fn().mockResolvedValue(null),
      dispatchToUsers: vi.fn().mockResolvedValue([]),
      dispatchToAdmins: vi.fn().mockResolvedValue([]),
      dispatchToStationStakeholders: vi.fn().mockResolvedValue(undefined),
    }
  })

  describe("Issue Domain Entity", () => {
    it("should instantiate with OPEN status and record initial history", () => {
      const issue = new Issue({
        id: "issue-1",
        bookingId: "booking-1",
        customerId: "customer-1",
        stationId: "station-1",
        status: IssueStatus.OPEN,
        customerDescription: "Water marks left on the vehicle roof",
        customerEvidence: [{ public_id: "p1", url: "https://cloudinary.com/p1.jpg" }],
      })

      expect(issue.id).toBe("issue-1")
      expect(issue.status).toBe(IssueStatus.OPEN)
      expect(issue.customerEvidence).toHaveLength(1)
      expect(issue.compensationAmount).toBe(0)
    })

    it("should transition state from OPEN -> UNDER_REVIEW -> RESOLVED -> CLOSED", () => {
      const issue = new Issue({
        id: "issue-1",
        bookingId: "booking-1",
        customerId: "customer-1",
        stationId: "station-1",
        status: IssueStatus.OPEN,
        customerDescription: "Missed wax application",
      })

      issue.startReview("manager-1", "Starting investigation with CCTV footage")
      expect(issue.status).toBe(IssueStatus.UNDER_REVIEW)
      expect(issue.assignedManagerId).toBe("manager-1")
      expect(issue.managerNotes).toBe("Starting investigation with CCTV footage")

      issue.resolve("manager-1", ResolutionType.REFUND, "Full refund issued to wallet", 500)
      expect(issue.status).toBe(IssueStatus.RESOLVED)
      expect(issue.resolutionType).toBe(ResolutionType.REFUND)
      expect(issue.compensationAmount).toBe(500)
      expect(issue.resolvedBy).toBe("manager-1")

      issue.close("customer-1", "Customer accepted resolution")
      expect(issue.status).toBe(IssueStatus.CLOSED)
      expect(issue.history.length).toBeGreaterThanOrEqual(3)
    })

    it("should allow escalation to ESCALATED status", () => {
      const issue = new Issue({
        id: "issue-2",
        bookingId: "booking-2",
        customerId: "customer-2",
        stationId: "station-2",
        status: IssueStatus.OPEN,
        customerDescription: "Manager is non-responsive",
      })

      issue.escalate("customer-2", "No response for 48 hours")
      expect(issue.status).toBe(IssueStatus.ESCALATED)
    })
  })

  describe("CreateIssueUseCase", () => {
    it("should successfully create an issue for a valid booking", async () => {
      const useCase = new CreateIssueUseCase(
        mockIssueRepo,
        mockBookingRepo,
        mockNotificationDispatcher
      )

      vi.mocked(mockBookingRepo.findById).mockResolvedValue({
        id: "booking-1",
        userId: "customer-1",
        stationId: "station-1",
        bookingNumber: "WQ-1234",
      } as unknown as Booking)

      vi.mocked(mockIssueRepo.findByBookingId).mockResolvedValue(null)
      vi.mocked(mockIssueRepo.create).mockImplementation(async (issue) => issue)

      const result = await useCase.execute({
        bookingId: "booking-1",
        customerId: "customer-1",
        customerDescription: "Missed interior vacuuming",
      })

      expect(result.status).toBe(IssueStatus.OPEN)
      expect(result.bookingId).toBe("booking-1")
      expect(mockNotificationDispatcher.dispatchToStationStakeholders).toHaveBeenCalled()
    })

    it("should throw ForbiddenError if booking belongs to another user", async () => {
      const useCase = new CreateIssueUseCase(mockIssueRepo, mockBookingRepo)

      vi.mocked(mockBookingRepo.findById).mockResolvedValue({
        id: "booking-1",
        userId: "other-user",
        stationId: "station-1",
      } as unknown as Booking)

      await expect(
        useCase.execute({
          bookingId: "booking-1",
          customerId: "customer-1",
          customerDescription: "Issue description",
        })
      ).rejects.toThrow(ForbiddenError)
    })

    it("should throw ConflictError if an active issue already exists for booking", async () => {
      const useCase = new CreateIssueUseCase(mockIssueRepo, mockBookingRepo)

      vi.mocked(mockBookingRepo.findById).mockResolvedValue({
        id: "booking-1",
        userId: "customer-1",
        stationId: "station-1",
      } as unknown as Booking)

      vi.mocked(mockIssueRepo.findByBookingId).mockResolvedValue(
        new Issue({
          id: "issue-existing",
          bookingId: "booking-1",
          customerId: "customer-1",
          stationId: "station-1",
          status: IssueStatus.OPEN,
          customerDescription: "Previous issue",
        })
      )

      await expect(
        useCase.execute({
          bookingId: "booking-1",
          customerId: "customer-1",
          customerDescription: "Duplicate issue",
        })
      ).rejects.toThrow(ConflictError)
    })
  })

  describe("ResolveIssueUseCase", () => {
    it("should resolve issue and notify customer", async () => {
      const useCase = new ResolveIssueUseCase(mockIssueRepo, mockNotificationDispatcher)

      const issue = new Issue({
        id: "issue-1",
        bookingId: "booking-1",
        customerId: "customer-1",
        stationId: "station-1",
        status: IssueStatus.UNDER_REVIEW,
        customerDescription: "Scratch on bumper",
      })

      vi.mocked(mockIssueRepo.findById).mockResolvedValue(issue)
      vi.mocked(mockIssueRepo.save).mockImplementation(async (i) => i)

      const resolved = await useCase.execute({
        issueId: "issue-1",
        resolutionType: ResolutionType.SERVICE_REDO,
        resolutionNotes: "Offered free re-wash voucher",
        compensationAmount: 0,
        resolvedBy: "manager-1",
      })

      expect(resolved.status).toBe(IssueStatus.RESOLVED)
      expect(mockNotificationDispatcher.dispatch).toHaveBeenCalled()
    })
  })
})
