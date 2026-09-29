import { VECTOR_COLLECTIONS } from "@/common/constants/vector-collections.constants"
import {
  IVectorStore,
  RetrievedChunk,
  VectorChunk,
  VectorChunkMetadata,
  VectorSearchOptions,
} from "../../application/ports/vector.interface"
import { qdrant } from "@/infrastructure/database/qdrant/connect"

export class QdrantVectorStore implements IVectorStore {
  async upsert(chunks: VectorChunk[]): Promise<void> {
    await qdrant.upsert(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      wait: true,

      points: chunks.map((chunk) => ({
        id: chunk.id,

        vector: chunk.vector,

        payload: {
          content: chunk.content,
          documentId: chunk.documentId,
          chunkIndex: chunk.metadata.chunkIndex,
          totalChunks: chunk.metadata.totalChunks,
          metadata: chunk.metadata,
        },
      })),
    })
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await qdrant.delete(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      wait: true,
      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: documentId,
            },
          },
        ],
      },
    })
  }

  async deleteStaleChunks(documentId: string, currentChunkIds: string[]): Promise<void> {
    const currentIdSet = new Set(currentChunkIds)
    const stalePointIds: (string | number)[] = []
    let offset: string | number | null | undefined = undefined

    // Scroll through existing points for this documentId
    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrollResult: any = await qdrant.scroll(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
        filter: {
          must: [
            {
              key: "documentId",
              match: {
                value: documentId,
              },
            },
          ],
        },
        limit: 100,
        offset: offset ?? undefined,
        with_payload: false,
        with_vector: false,
      })

      const points = scrollResult.points || []
      for (const point of points) {
        if (!currentIdSet.has(String(point.id))) {
          stalePointIds.push(point.id)
        }
      }

      offset = scrollResult.next_page_offset
    } while (offset)

    if (stalePointIds.length > 0) {
      await qdrant.delete(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
        wait: true,
        points: stalePointIds,
      })
    }
  }

  async countByDocumentId(documentId: string): Promise<number> {
    const result = await qdrant.count(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: documentId,
            },
          },
        ],
      },
      exact: true,
    })
    return result.count
  }
  async search(embedding: number[], options: VectorSearchOptions): Promise<RetrievedChunk[]> {
    const filterConditions: Record<string, unknown>[] = []

    if (options.filter?.documentId) {
      filterConditions.push({ key: "documentId", match: { value: options.filter.documentId } })
    }
    if (options.filter?.category) {
      filterConditions.push({ key: "metadata.category", match: { value: options.filter.category } })
    }
    if (options.filter?.locale) {
      filterConditions.push({ key: "metadata.locale", match: { value: options.filter.locale } })
    }

    const filter = filterConditions.length > 0 ? { must: filterConditions } : undefined

    const results = await qdrant.query(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      query: embedding,
      limit: options.limit,
      score_threshold: options.minScore,
      filter: filter,
      with_payload: true,
    })

    interface QdrantPoint {
      id: string | number
      score: number
      payload?: Record<string, unknown>
    }

    return (results.points as QdrantPoint[]).map((result) => ({
      id: String(result.id),
      score: result.score,
      payload: {
        documentId: result.payload?.documentId as string,
        content: result.payload?.content as string,
        metadata: result.payload?.metadata as VectorChunkMetadata,
      },
    }))
  }
}
