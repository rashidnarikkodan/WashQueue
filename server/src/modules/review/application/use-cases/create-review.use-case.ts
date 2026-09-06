import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { BadRequestError } from "@/common/errors/bad-request-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { BookingStatus } from "@/common/constants/booking.constants"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"
import { Review } from "../../domain/entities/Review"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { CreateReviewDTO, ReviewResponseDTO } from "../dtos/review.dto"
import { ICreateReviewUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class CreateReviewUseCase implements ICreateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly stationRepository?: IStationRepository,
    private readonly notificationDispatcher?: INotificationDispatcherService
  ) {}

  async execute(userId: string, input: CreateReviewDTO): Promise<ReviewResponseDTO> {
    const booking = await this.bookingRepository.findById(input.bookingId)
    if (!booking) {
      throw new NotFoundError("Booking not found")
    }

    if (booking.userId?.toString() !== userId.toString()) {
      throw new ForbiddenError("You can only review your own bookings")
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestError("You can only submit a review after the booking is completed")
    }

    const existingReview = await this.reviewRepository.findByBookingId(input.bookingId)
    if (existingReview) {
      throw new ConflictError("A review has already been submitted for this booking")
    }

    const review = new Review({
      userId,
      ownerId: booking.ownerId,
      stationId: booking.stationId,
      bookingId: booking.id,
      rating: input.rating,
      comment: input.comment ?? "",
      updateCount: 0,
      createdAt: new Date(),
    })

    const createdReview = await this.reviewRepository.create(review)

    // Update station rating and review count
    if (this.stationRepository) {
      try {
        const summary = await this.reviewRepository.getStationRatingSummary(booking.stationId)
        const station = await this.stationRepository.findById(booking.stationId)
        if (station) {
          station.updateRating(summary.averageRating, summary.reviewCount)
          await this.stationRepository.save(station)
        }
      } catch {
        // Non-blocking station rating update
      }
    }

    // Optional notification to owner
    if (this.notificationDispatcher && booking.ownerId) {
      try {
        await this.notificationDispatcher.dispatch({
          recipientId: booking.ownerId,
          type: "SYSTEM",
          title: `New ${input.rating}★ Review Received`,
          message: input.comment
            ? `A customer rated your station ${input.rating}/5: "${input.comment.slice(0, 80)}..."`
            : `A customer gave a ${input.rating}/5 star rating for booking #${booking.id.slice(-6)}.`,
          data: {
            reviewId: createdReview.id,
            bookingId: booking.id,
            stationId: booking.stationId,
            rating: input.rating,
          },
          actionType: "NAVIGATE",
        })
      } catch {
        // Non-blocking notification
      }
    }

    return ReviewDTOMapper.toDTO(createdReview)
  }
}
