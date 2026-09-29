export interface VectorChunk {
  id: string
  vector: number[]
  documentId: string
  content: string
  metadata: VectorChunkMetadata
}

export interface VectorChunkMetadata {
  category: string
  locale: string
  version: number
  chunkIndex?: number
  totalChunks?: number
}

export interface VectorSearchOptions {
  limit: number
  minScore?: number

  filter?: {
    documentId?: string
    category?: string
    locale?: string
  }
}

export interface RetrievedChunk {
  id: string
  score: number
  payload: {
    documentId: string
    content: string
    metadata: VectorChunkMetadata
  }
}

export interface IVectorStore {
  upsert(chunks: VectorChunk[]): Promise<void>

  search(embedding: number[], options: VectorSearchOptions): Promise<RetrievedChunk[]>

  deleteByDocumentId(documentId: string): Promise<void>

  deleteStaleChunks(documentId: string, currentChunkIds: string[]): Promise<void>

  countByDocumentId?(documentId: string): Promise<number>
}
