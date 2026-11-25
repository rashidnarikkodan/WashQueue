import { Issue } from "../../domain/entities/Issue"
import { IssueResponseDTO } from "../dtos/issue.dto"

export class IssueDTOMapper {
  static toDTO(issue: Issue): IssueResponseDTO {
    const data = issue.data
    return {
      id: data.id || "",
      bookingId: data.bookingId,
      customerId: data.customerId,
      stationId: data.stationId,
      assignedManagerId: data.assignedManagerId,
      status: data.status,
      priority: data.priority,
      category: data.category,
      customerDescription: data.customerDescription,
      customerEvidence: data.customerEvidence ? [...data.customerEvidence] : [],
      managerNotes: data.managerNotes,
      managerEvidence: data.managerEvidence ? [...data.managerEvidence] : [],
      resolutionType: data.resolutionType,
      compensationAmount: data.compensationAmount ?? 0,
      resolutionNotes: data.resolutionNotes,
      resolvedAt: data.resolvedAt ? new Date(data.resolvedAt).toISOString() : null,
      resolvedBy: data.resolvedBy,
      resolvedByName: data.resolvedByName,
      history: (data.history || []).map((h) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        actionBy: h.actionBy,
        actionByName: h.actionByName,
        reason: h.reason,
        timestamp: h.timestamp instanceof Date ? h.timestamp : new Date(h.timestamp),
      })),
      customerDetails: data.customerDetails,
      stationDetails: data.stationDetails,
      bookingDetails: data.bookingDetails,
      createdAt:
        data.createdAt instanceof Date ? data.createdAt.toISOString() : String(data.createdAt),
      updatedAt:
        data.updatedAt instanceof Date ? data.updatedAt.toISOString() : String(data.updatedAt),
    }
  }

  static toListDTO(issues: Issue[]): IssueResponseDTO[] {
    return issues.map((i) => IssueDTOMapper.toDTO(i))
  }
}
