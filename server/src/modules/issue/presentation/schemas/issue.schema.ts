import { z } from "zod"
import { IssueStatus } from "../../domain/value-objects/issue-status.vo"
import { IssuePriority } from "../../domain/value-objects/issue-priority.vo"
import { ResolutionType } from "../../domain/value-objects/resolution-type.vo"

export const EvidenceSchema = z.object({
  public_id: z.string().min(1, "public_id is required"),
  url: z.string().url("Valid URL is required"),
  description: z.string().optional(),
})

export const createIssueSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  customerDescription: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  customerEvidence: z.array(EvidenceSchema).optional().default([]),
  category: z.string().optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
})

export const updateIssueStatusSchema = z.object({
  status: z.nativeEnum(IssueStatus).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  managerNotes: z.string().max(2000).optional(),
  managerEvidence: z.array(EvidenceSchema).optional(),
})

export const assignIssueSchema = z.object({
  managerId: z.string().min(1, "managerId is required"),
})

export const escalateIssueSchema = z.object({
  reason: z.string().min(5, "Escalation reason must be at least 5 characters"),
})

export const resolveIssueSchema = z.object({
  resolutionType: z.nativeEnum(ResolutionType),
  resolutionNotes: z.string().min(5, "Resolution notes must be at least 5 characters"),
  compensationAmount: z.number().min(0).optional().default(0),
})

export const closeIssueSchema = z.object({
  notes: z.string().optional(),
})

export const issueQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  status: z.nativeEnum(IssueStatus).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})
