import env from "@/configs/env.config";
import { IVectorStore, RetrievedChunk, VectorChunk, VectorSearchOptions } from "../../application/ports/vector.interface";

export class QdrantVectorStore implements IVectorStore{
    async upsert(chunks: VectorChunk[]): Promise<void> {
        const data = await fetch(`${env.QDRANT_URL}/collections/`)
    }
    async deleteByDocumentId(documentId: string): Promise<void> {
        
    }
    async search(embedding: number[], options: VectorSearchOptions): Promise<RetrievedChunk[]> {
        return []
    }

}