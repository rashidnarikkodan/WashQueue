import { z } from "zod"

export const askChatSchema = z.object({
  prompt: z
    .string({ message: "Prompt is required" })
    .trim()
    .min(1, "Prompt cannot be empty")
    .max(2000, "Prompt cannot exceed 2000 characters"),
})

export type AskChatInput = z.infer<typeof askChatSchema>
