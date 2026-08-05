import { TimeWindowInstance } from "../entities/TimeWindowInstance"

export interface ITimeWindowRepository {
  findByStationIdAndDate(stationId: string, date: string): Promise<TimeWindowInstance[]>
  findByStationIdAndDateRange(
    stationId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeWindowInstance[]>
  findById(id: string): Promise<TimeWindowInstance | null>
  findByStationIdAndWindowStart(
    stationId: string,
    windowStart: Date
  ): Promise<TimeWindowInstance | null>
  saveMany(windows: TimeWindowInstance[]): Promise<TimeWindowInstance[]>
  save(window: TimeWindowInstance): Promise<TimeWindowInstance>
  reserveCapacityAtomically(windowId: string): Promise<TimeWindowInstance | null>
  deleteByStationId(stationId: string): Promise<boolean>
}
