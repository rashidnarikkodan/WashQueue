import {
  NotificationActionType,
  NotificationChannel,
  NotificationType,
} from "../types/notification.types"

export interface NotificationProps {
  id: string
  userId: string
  type: NotificationType
  title: string
  channel: NotificationChannel
  actionType: NotificationActionType
  message: string
  data: string
  isRead: boolean
  isActioned: boolean
  isDeleted?: boolean
  createdAt: Date
  updatedAt?: Date
}

export class Notification {
  constructor(private readonly props: NotificationProps) {}

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get type(): NotificationType {
    return this.props.type
  }

  get title(): string {
    return this.props.title
  }

  get channel(): NotificationChannel {
    return this.props.channel
  }

  get actionType(): NotificationActionType {
    return this.props.actionType
  }

  get message(): string {
    return this.props.message
  }

  get payloadData(): string {
    return this.props.data
  }

  get isRead(): boolean {
    return this.props.isRead
  }

  get isActioned(): boolean {
    return this.props.isActioned
  }

  get isDeleted(): boolean {
    return this.props.isDeleted ?? false
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  markAsRead(): void {
    this.props.isRead = true
  }

  markAsUnread(): void {
    this.props.isRead = false
  }

  markAsActioned(): void {
    this.props.isActioned = true
  }

  softDelete(): void {
    this.props.isDeleted = true
  }

  get data(): NotificationProps {
    return { ...this.props }
  }
}
