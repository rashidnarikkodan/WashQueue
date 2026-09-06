import {
  NotificationActionType,
  NotificationChannel,
  NotificationType,
} from "../types/notification.types"

export interface NotificationProps {
  id: string
  recipientId: string
  senderId?: string
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
  expiresAt?: Date
}

export class Notification {
  constructor(private readonly props: NotificationProps) {}

  get id(): string {
    return this.props.id
  }

  get recipientId(): string {
    return this.props.recipientId
  }

  get senderId(): string | undefined {
    return this.props.senderId
  }

  get expiresAt(): Date | undefined {
    return this.props.expiresAt
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
