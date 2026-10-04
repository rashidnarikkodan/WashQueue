import { CloseIssueDTO } from "../dtos/issue.dto"
import { ICloseIssueUseCase } from "../interfaces/issue-usecases.interface"
import { Issue } from "../../domain/entities/Issue"
import { IIssueRepository } from "../../domain/repositories/issue.repository.interface"
import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"

export class CloseIssueUseCase implements ICloseIssueUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(dto: CloseIssueDTO): Promise<Issue> {
    const issue = await this.issueRepository.findById(dto.issueId)
    if (!issue) {
      throw new NotFoundError(`Issue #${dto.issueId} not found`)
    }

    issue.close(dto.closedBy, dto.notes)

    const updated = await this.issueRepository.save(issue)
    if (!updated) {
      throw new BadRequestError("Failed to close issue")
    }

    return updated
  }
}
