import { NotFoundError } from "@/common/errors/not-found-error"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { ROLE } from "@/common/constants/role.constants"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { SettlementResponseDTO } from "../dtos/settlement.dto"
import { IGetSettlementByIdUseCase } from "../interfaces/settlement.usecases"

export class GetSettlementByIdUseCase implements IGetSettlementByIdUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  async execute(
    settlementId: string,
    requestingUserId: string,
    userRole: string
  ): Promise<SettlementResponseDTO> {
    const s = await this.settlementRepository.findById(settlementId)
    if (!s) {
      throw new NotFoundError("Settlement record not found")
    }

    if (userRole !== ROLE.ADMIN) {
      let owner = await this.ownerRepository.findByUserId(requestingUserId)
      if (!owner) {
        owner = await this.ownerRepository.findById(requestingUserId)
      }

      if (!owner || s.ownerId !== owner.id) {
        throw new UnauthorizedError("You are not authorized to view this settlement")
      }
    }

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
          booking.walkInVehicle?.registrationNumber || booking.vehicleDetails?.registrationNumber
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
      transferId: s.transferId,
      holdReason: s.holdReason,
      failureReason: s.failureReason,
      retryCount: s.retryCount,
      lastRetriedAt: s.lastRetriedAt?.toISOString(),
      settledAt: s.settledAt?.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt?.toISOString(),
      bookingNumber,
      stationName,
      customerName,
      vehicleRegNumber,
      serviceName,
      paymentMethod,
    }
  }
}
