export interface IStationRatingSyncService {
  syncStationRating(stationId: string): Promise<void>
}
