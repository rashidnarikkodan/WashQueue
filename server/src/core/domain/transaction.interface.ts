export interface ITransactionRunner {
  runInTransaction<T>(work: (session?: unknown) => Promise<T>): Promise<T>
}
