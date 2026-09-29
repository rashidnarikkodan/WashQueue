import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { IChunkerService } from "../../application/interfaces/chunker.interface"

export class LangChainChunker implements IChunkerService {
  private readonly splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  })
  async chunk(content: string): Promise<string[]> {
    const documents = await this.splitter.createDocuments([content])
    return documents.map((document) => document.pageContent)
  }
}
