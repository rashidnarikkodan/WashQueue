import { IGetCustomerIssuesUseCase } from "../interfaces/issue-usecases.interface"
import {
  FindIssuesFilterOptions,
  IIssueRepository,
  IssuesPaginatedResult,
} from "../../domain/repositories/issue.repository.interface"

export class GetCustomerIssuesUseCase implements IGetCustomerIssuesUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(
    customerId: string,
    options?: FindIssuesFilterOptions
  ): Promise<IssuesPaginatedResult> {
    return this.issueRepository.findByCustomerId(customerId, options)
  }
}
