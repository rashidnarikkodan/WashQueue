import { EscalateIssueDTO } from "../dtos/issue.dto"
import { IEscalateIssueUseCase } from "../interfaces/issue-usecases.interface"
import { Issue } from "../../domain/entities/Issue"
import { IIssueRepository } from "../../domain/repositories/issue.repository.interface"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"
import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"

export class EscalateIssueUseCase implements IEscalateIssueUseCase {
  constructor(
    private readonly issueRepository: IIssueRepository,
    private readonly notificationDispatcher?: INotificationDispatcherService
  ) {}

  async execute(dto: EscalateIssueDTO): Promise<Issue> {
    const issue = await this.issueRepository.findById(dto.issueId)
    if (!issue) {
      throw new NotFoundError(`Issue #${dto.issueId} not found`)
    }

    issue.escalate(dto.escalatedBy, dto.reason)

    const updated = await this.issueRepository.save(issue)
    if (!updated) {
      throw new BadRequestError("Failed to escalate issue")
    }

    if (this.notificationDispatcher) {
      this.notificationDispatcher
        .dispatchToAdmins({
          type: "SYSTEM",
          title: "Issue Escalated",
          message: `Issue #${issue.id} has been escalated to Admin: ${dto.reason}`,
          data: { issueId: issue.id, stationId: issue.stationId },
        })
        .catch(() => {})
    }

    return updated
  }
}
