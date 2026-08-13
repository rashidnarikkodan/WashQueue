import { TimeWindowInstance } from "../entities/TimeWindowInstance"

export interface ITimeWindowRepository {
  findByStationIdAndDate(stationId: string, date: string): Promise<TimeWindowInstance[]>
  findByStationIdAndDateRange(
    stationId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeWindowInstance[]>

  findLatestWindowDateForStation(stationId: string): Promise<string | null>
  findById(id: string): Promise<TimeWindowInstance | null>
  findByStationIdAndWindowStart(
    stationId: string,
    windowStart: Date
  ): Promise<TimeWindowInstance | null>
  saveMany(windows: TimeWindowInstance[]): Promise<TimeWindowInstance[]>
  save(window: TimeWindowInstance): Promise<TimeWindowInstance>
  reserveCapacityAtomically(windowId: string): Promise<TimeWindowInstance | null>
  reserveWalkInCapacityAtomically(windowId: string): Promise<TimeWindowInstance | null>
  releaseCapacityAtomically(windowId: string): Promise<TimeWindowInstance | null>
  deleteByStationId(stationId: string): Promise<boolean>
  deleteUnbookedFutureWindows(stationId: string, fromDate?: Date): Promise<number>
  updateExpiredWindowsStatus(now?: Date): Promise<number>
}
