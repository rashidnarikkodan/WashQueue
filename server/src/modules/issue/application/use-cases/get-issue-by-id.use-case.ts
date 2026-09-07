import { IGetIssueByIdUseCase } from "../interfaces/issue-usecases.interface"
import { Issue } from "../../domain/entities/Issue"
import { IIssueRepository } from "../../domain/repositories/issue.repository.interface"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ROLE } from "@/common/constants/role.constants"

export class GetIssueByIdUseCase implements IGetIssueByIdUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(
    issueId: string,
    requestingUserId: string,
    requestingUserRole: string
  ): Promise<Issue> {
    const issue = await this.issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError(`Issue with ID ${issueId} not found`)
    }

    const isCustomer = requestingUserRole === ROLE.CUSTOMER

    if (isCustomer && issue.customerId !== requestingUserId) {
      throw new ForbiddenError("You are not authorized to view this issue")
    }

    return issue
  }
}
