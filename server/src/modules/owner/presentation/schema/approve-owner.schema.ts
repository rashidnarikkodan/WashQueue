import { z } from "zod"

export const approveOwnerSchema = z
  .object({
    isApproved: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    action: z.enum(["APPROVE", "REJECT"]).optional(),
    rejectionReason: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      typeof data.isApproved === "boolean" ||
      typeof data.isVerified === "boolean" ||
      data.action !== undefined,
    {
      message: "Approval decision required (isApproved, isVerified, or action)",
      path: ["isApproved"],
    }
  )
  .refine(
    (data) => {
      const isReject =
        data.isApproved === false ||
        data.isVerified === false ||
        data.action === "REJECT"
      if (isReject) {
        return !!data.rejectionReason && data.rejectionReason.trim().length > 0
      }
      return true
    },
    {
      message: "Rejection reason is required when rejecting an owner application",
      path: ["rejectionReason"],
    }
  )

export type ApproveOwnerSchemaInput = z.infer<typeof approveOwnerSchema>
