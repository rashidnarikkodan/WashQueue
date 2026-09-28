export interface IIndexKnowledgeDocumentUseCase {
  execute(documentId: string): Promise<void>;
}
