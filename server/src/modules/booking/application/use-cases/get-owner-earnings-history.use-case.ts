import { NotFoundError } from "@/common/errors/not-found-error"
import { BookingStatus } from "@/common/constants/booking.constants"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { SettlementPaginationDTO } from "../dtos/settlement.dto"
import { IGetOwnerEarningsHistoryUseCase } from "../interfaces/settlement.usecases"

export interface OwnerEarningsItemDTO {
  bookingId: string
  bookingNumber: string
  stationName: string
  serviceType: string
  vehicleRegNumber: string
  customerName: string
  completedAt: string
  grossAmount: number
  platformCommission: number
  netEarnings: number
  paymentMethod: string
  settlementStatus: string
  transferId?: string
}

export class GetOwnerEarningsHistoryUseCase implements IGetOwnerEarningsHistoryUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly settlementRepository: ISettlementRepository
  ) {}

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SettlementPaginationDTO<OwnerEarningsItemDTO>> {
    let owner = await this.ownerRepository.findByUserId(userId)
    if (!owner) {
      owner = await this.ownerRepository.findById(userId)
    }

    if (!owner || !owner.id) {
      throw new NotFoundError("Owner profile not found for this user")
    }

    const { bookings, total } = await this.bookingRepository.findBookings({
      ownerId: owner.id,
      status: BookingStatus.COMPLETED,
      page,
      limit,
    })

    const earningsItems: OwnerEarningsItemDTO[] = await Promise.all(
      bookings.map(async (b) => {
        let settlementStatus = "PENDING"
        let transferId: string | undefined

        const settlement = await this.settlementRepository.findByBookingId(b.id)
        if (settlement) {
          settlementStatus = settlement.status
          transferId = settlement.transferId
        }

        return {
          bookingId: b.id,
          bookingNumber: b.bookingNumber,
          stationName: b.stationDetails?.name || "Station",
          serviceType: b.serviceType,
          vehicleRegNumber:
            b.walkInVehicle?.registrationNumber ||
            b.vehicleDetails?.registrationNumber ||
            "N/A",
          customerName: b.walkInCustomer?.name || b.customerDetails?.name || "Customer",
          completedAt: (b.completedAt || new Date()).toISOString(),
          grossAmount: b.pricingSnapshot.totalPrice,
          platformCommission: b.settlement?.platformCommission || 0,
          netEarnings: b.settlement?.stationSettlement || 0,
          paymentMethod: b.paymentMethod,
          settlementStatus,
          transferId,
        }
      })
    )

    return {
      data: earningsItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }
}
