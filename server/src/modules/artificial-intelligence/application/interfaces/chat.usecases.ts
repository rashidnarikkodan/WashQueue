export interface IAskKnowledgeUseCase {
  execute(prompt: string): Promise<string>
}
