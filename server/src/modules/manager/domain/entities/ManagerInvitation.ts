import { ManagerPermission } from "./ManagerAssignment"

export enum ManagerInvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export interface ManagerInvitationProps {
  id?: string
  email: string
  name?: string
  stationId: string
  ownerId: string
  permissions: ManagerPermission[]
  token: string
  status?: ManagerInvitationStatus
  expiresAt: Date
  createdAt?: Date
  updatedAt?: Date
}

export class ManagerInvitation {
  readonly id?: string
  readonly email: string
  readonly name?: string
  readonly stationId: string
  readonly ownerId: string
  readonly permissions: ManagerPermission[]
  readonly token: string
  private _status: ManagerInvitationStatus
  readonly expiresAt: Date
  readonly createdAt?: Date
  readonly updatedAt?: Date

  constructor(props: ManagerInvitationProps) {
    this.id = props.id
    this.email = props.email.toLowerCase().trim()
    this.name = props.name
    this.stationId = props.stationId
    this.ownerId = props.ownerId
    this.permissions = props.permissions
    this.token = props.token
    this._status = props.status ?? ManagerInvitationStatus.PENDING
    this.expiresAt = props.expiresAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  get status(): ManagerInvitationStatus {
    return this._status
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt || this._status === ManagerInvitationStatus.EXPIRED
  }

  get isPending(): boolean {
    return this._status === ManagerInvitationStatus.PENDING && !this.isExpired
  }

  accept(): void {
    if (this.isExpired) {
      this._status = ManagerInvitationStatus.EXPIRED
      throw new Error("Cannot accept an expired invitation")
    }
    if (this._status !== ManagerInvitationStatus.PENDING) {
      throw new Error(`Cannot accept invitation with status ${this._status}`)
    }
    this._status = ManagerInvitationStatus.ACCEPTED
  }

  reject(): void {
    if (this._status !== ManagerInvitationStatus.PENDING) {
      throw new Error(`Cannot reject invitation with status ${this._status}`)
    }
    this._status = ManagerInvitationStatus.REJECTED
  }

  cancel(): void {
    if (this._status !== ManagerInvitationStatus.PENDING) {
      throw new Error(`Cannot cancel invitation with status ${this._status}`)
    }
    this._status = ManagerInvitationStatus.CANCELLED
  }

  toJSON(): ManagerInvitationProps {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      stationId: this.stationId,
      ownerId: this.ownerId,
      permissions: this.permissions,
      token: this.token,
      status: this.status,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
