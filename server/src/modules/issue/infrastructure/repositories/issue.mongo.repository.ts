import { Query, Types } from "mongoose"
import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { Issue } from "../../domain/entities/Issue"
import { IssueStatus } from "../../domain/value-objects/issue-status.vo"
import {
  FindIssuesFilterOptions,
  IIssueRepository,
  IssuesPaginatedResult,
} from "../../domain/repositories/issue.repository.interface"
import { IssueMapper } from "../mappers/issue.mapper"
import { IIssueDocument, IssueModel } from "../models/issue.model"

export class IssueMongoRepository
  extends BaseRepository<Issue, IIssueDocument>
  implements IIssueRepository
{
  constructor() {
    super(IssueModel, new IssueMapper())
  }

  async create(issue: Issue): Promise<Issue> {
    return this.save(issue)
  }

  private applyPopulate<T>(query: Query<T, IIssueDocument>) {
    return query
      .populate("customerId", "name email phone avatar")
      .populate("stationId", "name city address phone")
      .populate("assignedManagerId", "name email phone avatar")
      .populate("resolvedBy", "name email")
      .populate("history.actionBy", "name email")
      .populate({
        path: "bookingId",
        select:
          "bookingNumber serviceType pricingSnapshot completedAt vehicleId walkInVehicle preServiceInspection postServiceInspection",
        populate: {
          path: "vehicleId",
          select: "brand vehicle_model registrationNumber nickname",
        },
      })
  }

  async findByBookingId(bookingId: string): Promise<Issue | null> {
    if (!Types.ObjectId.isValid(bookingId)) return null
    const found = await this.applyPopulate(
      this.model.findOne({ bookingId: new Types.ObjectId(bookingId) })
    ).exec()

    return found ? this.mapper.toDomain(found) : null
  }

  override async findById(id: string): Promise<Issue | null> {
    if (!id || !Types.ObjectId.isValid(id)) return null
    const found = await this.applyPopulate(this.model.findById(id)).exec()

    return found ? this.mapper.toDomain(found) : null
  }

  async findByCustomerId(
    customerId: string,
    options: FindIssuesFilterOptions = {}
  ): Promise<IssuesPaginatedResult> {
    const combinedOptions: FindIssuesFilterOptions = { ...options, customerId }
    return this.findWithFilters(combinedOptions)
  }

  async findByStationId(
    stationId: string,
    options: FindIssuesFilterOptions = {}
  ): Promise<IssuesPaginatedResult> {
    const combinedOptions: FindIssuesFilterOptions = { ...options, stationId }
    return this.findWithFilters(combinedOptions)
  }

  async findAll(options: FindIssuesFilterOptions = {}): Promise<IssuesPaginatedResult> {
    return this.findWithFilters(options)
  }

  async countByStation(stationId: string, status?: IssueStatus): Promise<number> {
    if (!Types.ObjectId.isValid(stationId)) return 0
    const query: Record<string, unknown> = {
      stationId: new Types.ObjectId(stationId),
    }
    if (status) {
      query.status = status
    }
    return this.model.countDocuments(query).exec()
  }

  private async findWithFilters(options: FindIssuesFilterOptions): Promise<IssuesPaginatedResult> {
    const page = Math.max(1, options.page || 1)
    const limit = Math.max(1, Math.min(100, options.limit || 10))
    const skip = (page - 1) * limit

    const query: Record<string, unknown> = {}

    if (options.customerId && Types.ObjectId.isValid(options.customerId)) {
      query.customerId = new Types.ObjectId(options.customerId)
    }

    if (options.stationId && Types.ObjectId.isValid(options.stationId)) {
      query.stationId = new Types.ObjectId(options.stationId)
    }

    if (options.bookingId && Types.ObjectId.isValid(options.bookingId)) {
      query.bookingId = new Types.ObjectId(options.bookingId)
    }

    if (options.assignedManagerId && Types.ObjectId.isValid(options.assignedManagerId)) {
      query.assignedManagerId = new Types.ObjectId(options.assignedManagerId)
    }

    if (options.status) {
      if (Array.isArray(options.status)) {
        query.status = { $in: options.status }
      } else {
        query.status = options.status
      }
    }

    if (options.priority) {
      if (Array.isArray(options.priority)) {
        query.priority = { $in: options.priority }
      } else {
        query.priority = options.priority
      }
    }

    if (options.category) {
      query.category = options.category
    }

    if (options.search && options.search.trim().length > 0) {
      const searchRegex = new RegExp(options.search.trim(), "i")
      query.$or = [
        { customerDescription: searchRegex },
        { managerNotes: searchRegex },
        { resolutionNotes: searchRegex },
      ]
    }

    if (options.startDate || options.endDate) {
      const dateQuery: Record<string, Date> = {}
      if (options.startDate) dateQuery.$gte = options.startDate
      if (options.endDate) dateQuery.$lte = options.endDate
      query.createdAt = dateQuery
    }

    const sortField = options.sortBy || "createdAt"
    const sortOrder = options.sortOrder || -1
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortOrder }

    const [docs, total] = await Promise.all([
      this.applyPopulate(this.model.find(query).sort(sortOptions).skip(skip).limit(limit)).exec(),
      this.model.countDocuments(query).exec(),
    ])

    const issues = (docs as unknown as IIssueDocument[]).map((doc) => this.mapper.toDomain(doc))

    return {
      issues,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    }
  }
}
