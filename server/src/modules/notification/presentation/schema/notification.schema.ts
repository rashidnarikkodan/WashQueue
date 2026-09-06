import { z } from "zod"

export const getNotificationsQuerySchema = z.object({
  isRead: z
    .preprocess((val) => {
      if (val === "true" || val === true) return true
      if (val === "false" || val === false) return false
      return undefined
    }, z.boolean().optional())
    .optional(),
  type: z.enum(["BOOKING", "PAYMENT", "QUEUE", "SYSTEM"]).optional(),
  page: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().int().positive().optional()
    )
    .optional(),
  limit: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().int().positive().max(100).optional()
    )
    .optional(),
})

export const createNotificationSchema = z.object({
  recipientId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Recipient ID")
    .optional(),
  userId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
    .optional(),
  type: z.enum(["BOOKING", "PAYMENT", "QUEUE", "SYSTEM"]),
  title: z.string().min(1, "Title is required").max(150),
  channel: z.string().min(1).max(50).optional().default("IN_APP"),
  actionType: z.string().min(1).max(50).optional().default("NONE"),
  message: z.string().min(1, "Message is required").max(1000),
  data: z
    .union([z.string(), z.record(z.string(), z.unknown())])
    .optional()
    .default("{}"),
})

export const notificationIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Notification ID"),
})
