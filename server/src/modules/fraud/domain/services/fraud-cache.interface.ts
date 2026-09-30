export interface IFraudCacheService {
  incrementWithTtl(key: string, ttlSeconds: number): Promise<number>
  recordTimestampInWindow(setKey: string, timestamp: number, windowSeconds: number): Promise<number>
  getSetCardinality(key: string): Promise<number>
  addToSetWithTtl(key: string, value: string, ttlSeconds: number): Promise<void>
  getCounter(key: string): Promise<number>
}
