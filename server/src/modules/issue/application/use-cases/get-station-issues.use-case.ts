import { IGetStationIssuesUseCase } from "../interfaces/issue-usecases.interface"
import {
  FindIssuesFilterOptions,
  IIssueRepository,
  IssuesPaginatedResult,
} from "../../domain/repositories/issue.repository.interface"

export class GetStationIssuesUseCase implements IGetStationIssuesUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(
    stationId: string,
    options?: FindIssuesFilterOptions
  ): Promise<IssuesPaginatedResult> {
    return this.issueRepository.findByStationId(stationId, options)
  }
}
