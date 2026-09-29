import { IAskKnowledgeUseCase } from "../../interfaces/chat.usecases"
import { ISearchKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"
import { ILLMProvider } from "../../ports/ai-provider.interface"

export class AskKnowledgeUseCase implements IAskKnowledgeUseCase {
  constructor(
    private readonly llm: ILLMProvider,
    private readonly searchUseCase: ISearchKnowledgeDocumentUseCase
  ) {}
  async execute(prompt: string): Promise<string> {
    const retrieved = await this.searchUseCase.execute({
      query: prompt,
    })
    const context = retrieved
      .map((item) => item.payload?.content)
      .filter((content): content is string => Boolean(content))
      .join("\n\n")

    const output = await this.llm.generate({
      prompt,
      systemPrompt: context,
    })
    return output.content
  }
}
