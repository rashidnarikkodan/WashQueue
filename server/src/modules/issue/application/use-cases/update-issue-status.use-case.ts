import { UpdateIssueStatusDTO } from "../dtos/issue.dto"
import { IUpdateIssueStatusUseCase } from "../interfaces/issue-usecases.interface"
import { Issue } from "../../domain/entities/Issue"
import { IssueStatus } from "../../domain/value-objects/issue-status.vo"
import { IIssueRepository } from "../../domain/repositories/issue.repository.interface"
import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"

export class UpdateIssueStatusUseCase implements IUpdateIssueStatusUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(dto: UpdateIssueStatusDTO): Promise<Issue> {
    const issue = await this.issueRepository.findById(dto.issueId)
    if (!issue) {
      throw new NotFoundError(`Issue #${dto.issueId} not found`)
    }

    if (dto.status === IssueStatus.UNDER_REVIEW) {
      issue.startReview(dto.actionBy, dto.managerNotes)
    }

    issue.updateManagerNotesAndEvidence(dto.managerNotes, dto.managerEvidence)

    const updated = await this.issueRepository.save(issue)
    if (!updated) {
      throw new BadRequestError("Failed to update issue")
    }

    return updated
  }
}
