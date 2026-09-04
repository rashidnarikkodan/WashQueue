import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import {
  SettlementFilterOptions,
  SettlementPaginationDTO,
  SettlementResponseDTO,
} from "../dtos/settlement.dto"
import { IGetAdminSettlementsUseCase } from "../interfaces/settlement.usecases"

export class GetAdminSettlementsUseCase implements IGetAdminSettlementsUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  async execute(
    filters: SettlementFilterOptions
  ): Promise<SettlementPaginationDTO<SettlementResponseDTO>> {
    const page = Math.max(Number(filters.page) || 1, 1)
    const limit = Math.max(Number(filters.limit) || 10, 1)

    const { settlements, total } = await this.settlementRepository.findMany({
      ...filters,
      page,
      limit,
    })

    const enriched: SettlementResponseDTO[] = await Promise.all(
      settlements.map(async (s) => {
        let bookingNumber: string | undefined
        let stationName: string | undefined
        let customerName: string | undefined
        let vehicleRegNumber: string | undefined
        let serviceName: string | undefined
        let paymentMethod: string | undefined

        try {
          const booking = await this.bookingRepository.findById(s.bookingId)
          if (booking) {
            bookingNumber = booking.bookingNumber
            stationName = booking.stationDetails?.name
            customerName = booking.walkInCustomer?.name || booking.customerDetails?.name
            vehicleRegNumber =
              booking.walkInVehicle?.registrationNumber ||
              booking.vehicleDetails?.registrationNumber
            serviceName = booking.serviceType
            paymentMethod = booking.paymentMethod
          }
        } catch {
          // ignore enrichment error
        }

        return {
          id: s.id || "",
          bookingId: s.bookingId,
          ownerId: s.ownerId,
          stationId: s.stationId,
          totalAmount: s.totalAmount,
          platformCommission: s.platformCommission,
          platformCommissionRate: s.platformCommissionRate,
          stationSettlementAmount: s.stationSettlementAmount,
          currency: s.currency,
          status: s.status,
          payoutId: s.payoutId,
          holdReason: s.holdReason,
          failureReason: s.failureReason,
          retryCount: s.retryCount,
          lastRetriedAt: s.lastRetriedAt?.toISOString(),
          processedAt: s.processedAt?.toISOString(),
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt?.toISOString(),
          bookingNumber,
          stationName,
          customerName,
          vehicleRegNumber,
          serviceName,
          paymentMethod,
        }
      })
    )

    return {
      data: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }
}
