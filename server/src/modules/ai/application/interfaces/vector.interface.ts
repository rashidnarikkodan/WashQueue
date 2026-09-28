export interface VectorChunk {
  id: string
  documentId: string
  content: string
  embedding: number[]
  metadata: VectorChunkMetadata
}

export interface VectorChunkMetadata {
  category: string
  locale: string
  version: number
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
  documentId: string
  content: string
  score: number
  metadata: VectorChunkMetadata
}

export interface IVectorStore {
  upsert(chunks: VectorChunk[]): Promise<void>

  search(embedding: number[], options: VectorSearchOptions): Promise<RetrievedChunk[]>

  deleteByDocumentId(documentId: string): Promise<void>
}
