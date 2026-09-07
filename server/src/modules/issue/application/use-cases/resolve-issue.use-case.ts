import { ResolveIssueDTO } from "../dtos/issue.dto"
import { IResolveIssueUseCase } from "../interfaces/issue-usecases.interface"
import { Issue } from "../../domain/entities/Issue"
import { IIssueRepository } from "../../domain/repositories/issue.repository.interface"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"
import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"

export class ResolveIssueUseCase implements IResolveIssueUseCase {
  constructor(
    private readonly issueRepository: IIssueRepository,
    private readonly notificationDispatcher?: INotificationDispatcherService
  ) {}

  async execute(dto: ResolveIssueDTO): Promise<Issue> {
    const issue = await this.issueRepository.findById(dto.issueId)
    if (!issue) {
      throw new NotFoundError(`Issue #${dto.issueId} not found`)
    }

    issue.resolve(dto.resolvedBy, dto.resolutionType, dto.resolutionNotes, dto.compensationAmount)

    const updated = await this.issueRepository.save(issue)
    if (!updated) {
      throw new BadRequestError("Failed to save resolved issue")
    }

    if (this.notificationDispatcher) {
      this.notificationDispatcher
        .dispatch({
          recipientId: issue.customerId,
          type: "SYSTEM",
          title: "Concern Resolved",
          message: `Your issue regarding booking #${issue.bookingDetails?.bookingNumber ?? issue.bookingId} has been resolved (${dto.resolutionType}).`,
          data: { issueId: issue.id, resolutionType: dto.resolutionType },
        })
        .catch(() => {})
    }

    return updated
  }
}
