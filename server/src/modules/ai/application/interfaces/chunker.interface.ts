export interface IChunker {
  chunk(content: string): string[]
}
