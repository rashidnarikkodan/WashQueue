import mongoose from "mongoose"
import { ITransactionRunner } from "@/core/domain/transaction.interface"

export class MongooseTransactionRunner implements ITransactionRunner {
  async runInTransaction<T>(work: (session?: unknown) => Promise<T>): Promise<T> {
    const session = await mongoose.startSession()
    try {
      let result!: T
      await session.withTransaction(async () => {
        result = await work(session)
      })
      return result
    } finally {
      await session.endSession()
    }
  }
}
