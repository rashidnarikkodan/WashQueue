import { Types } from "mongoose"
import { IMapper } from "@/core/domain/repository.interface"
import { Payout } from "../../domain/entities/Payout"
import { IPayoutDocument } from "../models/payout.model"

export class PayoutMapper implements IMapper<Payout, IPayoutDocument> {
  toDomain(doc: IPayoutDocument): Payout {
    return new Payout({
      id: doc._id.toString(),
      settlementId: doc.settlementId.toString(),
      ownerId: doc.ownerId.toString(),
      provider: doc.provider,
      razorpayPayoutId: doc.razorpayPayoutId,
      amount: doc.amount,
      currency: doc.currency || "INR",
      status: doc.status,
      idempotencyKey: doc.idempotencyKey,
      failureReason: doc.failureReason,
      processedAt: doc.processedAt,
      failedAt: doc.failedAt,
      reversedAt: doc.reversedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  toPersistence(entity: Payout): Partial<IPayoutDocument> {
    const props = entity.getProps()
    return {
      settlementId: new Types.ObjectId(props.settlementId),
      ownerId: new Types.ObjectId(props.ownerId),
      provider: props.provider,
      razorpayPayoutId: props.razorpayPayoutId,
      amount: props.amount,
      currency: props.currency || "INR",
      status: props.status,
      idempotencyKey: props.idempotencyKey,
      failureReason: props.failureReason,
      processedAt: props.processedAt,
      failedAt: props.failedAt,
      reversedAt: props.reversedAt,
      createdAt: props.createdAt,
    }
  }
}
