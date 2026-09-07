import { Types } from "mongoose"
import { IMapper } from "@/core/domain/repository.interface"
import { Issue, IssueProps } from "../../domain/entities/Issue"
import { IssueStatus } from "../../domain/value-objects/issue-status.vo"
import { ResolutionType } from "../../domain/value-objects/resolution-type.vo"
import { IIssueDocument } from "../models/issue.model"

interface PopulatedUser {
  _id: Types.ObjectId
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

interface PopulatedStation {
  _id: Types.ObjectId
  name?: string
  city?: string
  address?: string
}

interface PopulatedBooking {
  _id: Types.ObjectId
  bookingNumber?: string
  serviceType?: string
  pricingSnapshot?: { totalPrice?: number }
  completedAt?: Date
}

export class IssueMapper implements IMapper<Issue, IIssueDocument> {
  toDomain(
    raw: IIssueDocument & {
      customerId?: PopulatedUser | Types.ObjectId
      stationId?: PopulatedStation | Types.ObjectId
      bookingId?: PopulatedBooking | Types.ObjectId
    }
  ): Issue {
    const rawObj = typeof raw.toObject === "function" ? raw.toObject() : raw

    let customerDetails
    let customerIdStr = rawObj.customerId?.toString()
    if (rawObj.customerId && typeof rawObj.customerId === "object" && "_id" in rawObj.customerId) {
      const cust = rawObj.customerId as PopulatedUser
      customerIdStr = cust._id.toString()
      customerDetails = {
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        avatar: cust.avatar,
      }
    }

    let stationDetails
    let stationIdStr = rawObj.stationId?.toString()
    if (rawObj.stationId && typeof rawObj.stationId === "object" && "_id" in rawObj.stationId) {
      const st = rawObj.stationId as PopulatedStation
      stationIdStr = st._id.toString()
      stationDetails = {
        name: st.name,
        city: st.city,
        address: st.address,
      }
    }

    let bookingDetails
    let bookingIdStr = rawObj.bookingId?.toString()
    if (rawObj.bookingId && typeof rawObj.bookingId === "object" && "_id" in rawObj.bookingId) {
      const bk = rawObj.bookingId as PopulatedBooking
      bookingIdStr = bk._id.toString()
      bookingDetails = {
        bookingNumber: bk.bookingNumber,
        serviceType: bk.serviceType,
        totalPrice: bk.pricingSnapshot?.totalPrice,
        completedAt: bk.completedAt,
      }
    }

    const props: IssueProps = {
      id: rawObj._id ? rawObj._id.toString() : rawObj.id?.toString(),
      bookingId: bookingIdStr,
      customerId: customerIdStr,
      stationId: stationIdStr,
      assignedManagerId: rawObj.assignedManagerId ? rawObj.assignedManagerId.toString() : null,
      status: rawObj.status as IssueStatus,
      customerDescription: rawObj.customerDescription,
      customerEvidence: rawObj.customerEvidence || [],
      managerNotes: rawObj.managerNotes || null,
      managerEvidence: rawObj.managerEvidence || [],
      resolutionType: rawObj.resolutionType ? (rawObj.resolutionType as ResolutionType) : null,
      compensationAmount: rawObj.compensationAmount || 0,
      resolutionNotes: rawObj.resolutionNotes || null,
      resolvedAt: rawObj.resolvedAt ? new Date(rawObj.resolvedAt) : null,
      resolvedBy: rawObj.resolvedBy ? rawObj.resolvedBy.toString() : null,
      history: (rawObj.history || []).map(
        (h: {
          fromStatus: string
          toStatus: string
          actionBy?: Types.ObjectId | string
          reason?: string
          timestamp: Date
        }) => ({
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          actionBy: h.actionBy?.toString() || "",
          reason: h.reason,
          timestamp: new Date(h.timestamp),
        })
      ),
      customerDetails,
      stationDetails,
      bookingDetails,
      createdAt: rawObj.createdAt ? new Date(rawObj.createdAt) : undefined,
      updatedAt: rawObj.updatedAt ? new Date(rawObj.updatedAt) : undefined,
    }

    return new Issue(props)
  }

  toPersistence(entity: Partial<Issue>): Partial<IIssueDocument> {
    const data = entity instanceof Issue ? entity.data : (entity as IssueProps)
    const persistence: Record<string, unknown> = {}

    if (data.bookingId) persistence.bookingId = new Types.ObjectId(data.bookingId)
    if (data.customerId) persistence.customerId = new Types.ObjectId(data.customerId)
    if (data.stationId) persistence.stationId = new Types.ObjectId(data.stationId)
    if (data.assignedManagerId !== undefined) {
      persistence.assignedManagerId = data.assignedManagerId
        ? new Types.ObjectId(data.assignedManagerId)
        : null
    }
    if (data.status) persistence.status = data.status
    if (data.customerDescription !== undefined)
      persistence.customerDescription = data.customerDescription
    if (data.customerEvidence !== undefined) persistence.customerEvidence = data.customerEvidence
    if (data.managerNotes !== undefined) persistence.managerNotes = data.managerNotes
    if (data.managerEvidence !== undefined) persistence.managerEvidence = data.managerEvidence
    if (data.resolutionType !== undefined) persistence.resolutionType = data.resolutionType
    if (data.compensationAmount !== undefined)
      persistence.compensationAmount = data.compensationAmount
    if (data.resolutionNotes !== undefined) persistence.resolutionNotes = data.resolutionNotes
    if (data.resolvedAt !== undefined) persistence.resolvedAt = data.resolvedAt
    if (data.resolvedBy !== undefined) {
      persistence.resolvedBy = data.resolvedBy ? new Types.ObjectId(data.resolvedBy) : null
    }
    if (data.history !== undefined) {
      persistence.history = data.history.map((h) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        actionBy: Types.ObjectId.isValid(h.actionBy) ? new Types.ObjectId(h.actionBy) : h.actionBy,
        reason: h.reason,
        timestamp: h.timestamp,
      }))
    }

    return persistence as Partial<IIssueDocument>
  }
}
