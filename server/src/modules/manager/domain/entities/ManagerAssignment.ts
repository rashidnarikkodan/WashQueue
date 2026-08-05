export enum ManagerAssignmentStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum ManagerPermission {
  BOOKING_MANAGEMENT = "BOOKING_MANAGEMENT",
  QUEUE_MANAGEMENT = "QUEUE_MANAGEMENT",
  CUSTOMER_MANAGEMENT = "CUSTOMER_MANAGEMENT",
  PRICING_MANAGEMENT = "PRICING_MANAGEMENT",
  REPORTS_VIEW = "REPORTS_VIEW",
  STATION_SETTINGS = "STATION_SETTINGS",
}

export interface ManagerAssignmentProps {
  id?: string
  managerUserId: string
  stationId: string
  ownerId: string
  permissions: ManagerPermission[]
  status?: ManagerAssignmentStatus
  assignedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class ManagerAssignment {
  readonly id?: string
  readonly managerUserId: string
  readonly stationId: string
  readonly ownerId: string
  private _permissions: ManagerPermission[]
  private _status: ManagerAssignmentStatus
  readonly assignedAt: Date
  readonly createdAt?: Date
  readonly updatedAt?: Date

  constructor(props: ManagerAssignmentProps) {
    this.id = props.id
    this.managerUserId = props.managerUserId
    this.stationId = props.stationId
    this.ownerId = props.ownerId
    this._permissions = props.permissions
    this._status = props.status ?? ManagerAssignmentStatus.ACTIVE
    this.assignedAt = props.assignedAt ?? new Date()
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  get permissions(): ManagerPermission[] {
    return [...this._permissions]
  }

  get status(): ManagerAssignmentStatus {
    return this._status
  }

  get isActive(): boolean {
    return this._status === ManagerAssignmentStatus.ACTIVE
  }

  get isSuspended(): boolean {
    return this._status === ManagerAssignmentStatus.SUSPENDED
  }

  suspend(): void {
    this._status = ManagerAssignmentStatus.SUSPENDED
  }

  reactivate(): void {
    this._status = ManagerAssignmentStatus.ACTIVE
  }

  updatePermissions(newPermissions: ManagerPermission[]): void {
    this._permissions = [...newPermissions]
  }

  hasPermission(permission: ManagerPermission): boolean {
    return this._permissions.includes(permission)
  }

  toJSON(): ManagerAssignmentProps {
    return {
      id: this.id,
      managerUserId: this.managerUserId,
      stationId: this.stationId,
      ownerId: this.ownerId,
      permissions: this.permissions,
      status: this.status,
      assignedAt: this.assignedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
