export interface StationLiveQueueData {
  stationId: string
  stationName: string
  isOpen: boolean
  queueDepth: number
  estimatedWaitMins: number
  totalBays: number
  availableBays: number
  activeServicesCount: number
  isLive: boolean
}

export interface IQueueQueryPort {
  getStationQueue(stationId: string): Promise<StationLiveQueueData | null>
  findStationByName(name: string): Promise<{ id: string; name: string } | null>
}
