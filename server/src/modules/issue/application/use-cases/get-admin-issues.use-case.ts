import { IGetAdminIssuesUseCase } from "../interfaces/issue-usecases.interface"
import {
  FindIssuesFilterOptions,
  IIssueRepository,
  IssuesPaginatedResult,
} from "../../domain/repositories/issue.repository.interface"

export class GetAdminIssuesUseCase implements IGetAdminIssuesUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(options?: FindIssuesFilterOptions): Promise<IssuesPaginatedResult> {
    return this.issueRepository.findAll(options)
  }
}
