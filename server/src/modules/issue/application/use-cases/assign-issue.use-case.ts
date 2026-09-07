import { AssignIssueDTO } from "../dtos/issue.dto"
import { IAssignIssueUseCase } from "../interfaces/issue-usecases.interface"
import { Issue } from "../../domain/entities/Issue"
import { IIssueRepository } from "../../domain/repositories/issue.repository.interface"
import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"

export class AssignIssueUseCase implements IAssignIssueUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(dto: AssignIssueDTO): Promise<Issue> {
    const issue = await this.issueRepository.findById(dto.issueId)
    if (!issue) {
      throw new NotFoundError(`Issue #${dto.issueId} not found`)
    }

    issue.assignManager(dto.managerId, dto.assignedBy)

    const updated = await this.issueRepository.save(issue)
    if (!updated) {
      throw new BadRequestError("Failed to assign manager to issue")
    }

    return updated
  }
}
