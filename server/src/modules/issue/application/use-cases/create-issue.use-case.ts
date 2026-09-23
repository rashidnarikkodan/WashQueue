import { CreateIssueDTO } from "../dtos/issue.dto"
import { ICreateIssueUseCase } from "../interfaces/issue-usecases.interface"
import { Issue } from "../../domain/entities/Issue"
import { IssueStatus } from "../../domain/value-objects/issue-status.vo"
import { IssuePriority } from "../../domain/value-objects/issue-priority.vo"
import { IssueCategory } from "../../domain/value-objects/issue-category.vo"
import { IIssueRepository } from "../../domain/repositories/issue.repository.interface"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ConflictError } from "@/common/errors/conflict-error"

export class CreateIssueUseCase implements ICreateIssueUseCase {
  constructor(
    private readonly issueRepository: IIssueRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly notificationDispatcher?: INotificationDispatcherService
  ) {}

  async execute(dto: CreateIssueDTO): Promise<Issue> {
    const booking = await this.bookingRepository.findById(dto.bookingId)
    if (!booking) {
      throw new NotFoundError("Booking not found")
    }

    // Verify booking belongs to customer
    if (booking.userId !== dto.customerId) {
      throw new ForbiddenError("You can only raise issues for your own bookings")
    }

    // Check if an issue is already open / under review / escalated for this booking
    const existingIssue = await this.issueRepository.findByBookingId(dto.bookingId)
    if (
      existingIssue &&
      existingIssue.status !== IssueStatus.CLOSED &&
      existingIssue.status !== IssueStatus.RESOLVED
    ) {
      throw new ConflictError(
        `An active issue (#${existingIssue.id}) is already ${existingIssue.status} for this booking`
      )
    }

    const issue = new Issue({
      bookingId: dto.bookingId,
      customerId: dto.customerId,
      stationId: booking.stationId,
      status: IssueStatus.OPEN,
      priority: dto.priority ?? IssuePriority.MEDIUM,
      category: dto.category ?? IssueCategory.VEHICLE_DAMAGE,
      customerDescription: dto.customerDescription,
      customerEvidence: dto.customerEvidence ?? [],
      history: [
        {
          fromStatus: "NONE",
          toStatus: IssueStatus.OPEN,
          actionBy: dto.customerId,
          reason: "Customer raised concern",
          timestamp: new Date(),
        },
      ],
    })

    const createdIssue = await this.issueRepository.create(issue)

    // Notify station stakeholders if notification dispatcher is available
    if (this.notificationDispatcher) {
      this.notificationDispatcher
        .dispatchToStationStakeholders({
          stationId: booking.stationId,
          notifyManagers: true,
          notifyOwner: true,
          defaultPayload: {
            type: "SYSTEM",
            title: "New Issue Reported",
            message: `Customer reported an issue for booking #${booking.bookingNumber ?? booking.id}`,
            data: { issueId: createdIssue.id, bookingId: booking.id },
          },
        })
        .catch(() => {})
    }

    return createdIssue
  }
}
