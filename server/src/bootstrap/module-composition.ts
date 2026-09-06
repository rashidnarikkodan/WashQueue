import {
  createCreateWalkInBookingUseCase,
  createCancelBookingUseCase,
  createBookingController,
  createBookingRouter,
} from "@/modules/booking/booking.module"
import { bookingRedisQueueService } from "@/modules/queue/queue.module"
import { evaluateAndProcessRefundUseCase } from "@/modules/payment/payment.module"

const createWalkInBookingUseCase = createCreateWalkInBookingUseCase(bookingRedisQueueService)
const cancelBookingUseCase = createCancelBookingUseCase(
  bookingRedisQueueService,
  evaluateAndProcessRefundUseCase
)
const bookingController = createBookingController(createWalkInBookingUseCase, cancelBookingUseCase)

export const bookingRouter = createBookingRouter(bookingController)

export default bookingRouter
