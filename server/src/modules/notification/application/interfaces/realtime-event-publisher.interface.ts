export interface IRealtimeEventPublisher {
  emitToStation(stationId: string, event: string, payload: unknown): void
  emitToUser(userId: string, event: string, payload: unknown): void
  emitToBooking(bookingId: string, event: string, payload: unknown): void
}
