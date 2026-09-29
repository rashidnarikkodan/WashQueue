import { Document, model, Schema } from "mongoose"
import {
  KnowledgeDocumentCategory,
  KnowledgeDocumentStatus,
} from "../../domain/entities/KnowledgeDocument.entity"

export interface IKnowledgeDocument extends Document {
  title: string
  content: string
  category: KnowledgeDocumentCategory
  status: KnowledgeDocumentStatus
  locale: string
  version: number
  chunkCount: number
}

const KnowledgeDocumentSchema = new Schema<IKnowledgeDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["FAQ", "POLICY", "SERVICE", "BOOKING", "PAYMENT", "QUEUE", "SUPPORT"],
      required: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      required: true,
    },

    locale: {
      type: String,
      required: true,
      trim: true,
    },

    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    chunkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

export const KnowledgeDocumentModel = model<IKnowledgeDocument>(
  "KnowledgeDocument",
  KnowledgeDocumentSchema
)
