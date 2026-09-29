export interface IChunkerService {
  chunk(content: string): Promise<string[]>
}
