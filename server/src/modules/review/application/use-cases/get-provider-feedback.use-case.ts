import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { ProviderFeedbackResponseDTO } from "../dtos/review.dto"
import { ROLE } from "@/common/constants/role.constants"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export interface GetProviderFeedbackInput {
  userId: string
  userRole: string
  stationId?: string
  rating?: number
  pillFilter?: "ALL" | "LOW_RATED" | string
  search?: string
  sortBy?: "lowest" | "highest" | "recent" | string
  page?: number
  limit?: number
}

export class GetProviderFeedbackUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly stationRepository: IStationRepository
  ) {}

  async execute(input: GetProviderFeedbackInput): Promise<ProviderFeedbackResponseDTO> {
    const stations =
      input.userRole === ROLE.MANAGER
        ? await this.stationRepository.findByManagerId(input.userId)
        : await this.stationRepository.findByOwnerId(input.userId)

    const stationIds = stations.map((s) => s.id).filter(Boolean) as string[]

    if (stationIds.length === 0) {
      return {
        reviews: [],
        total: 0,
        page: input.page || 1,
        limit: input.limit || 10,
        totalPages: 0,
        stations: [],
      }
    }

    const result = await this.reviewRepository.findProviderFeedbackReviews({
      stationIds,
      stationId: input.stationId,
      rating: input.rating,
      pillFilter: input.pillFilter,
      search: input.search,
      sortBy: input.sortBy,
      page: input.page,
      limit: input.limit,
    })

    const reviews = result.items.map((item) =>
      ReviewDTOMapper.toDTO(item.review, {
        user: item.user,
        station: item.station,
        booking: item.booking,
      })
    )

    const stationOptions = stations
      .filter((s) => Boolean(s.id))
      .map((s) => ({
        id: s.id as string,
        name: s.name,
      }))

    return {
      reviews,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      stations: stationOptions,
    }
  }
}
