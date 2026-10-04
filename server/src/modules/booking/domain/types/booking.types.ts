export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  IN_SERVICE = "IN_SERVICE",
  SERVICE_COMPLETED = "SERVICE_COMPLETED",
  AWAITING_HANDOVER = "AWAITING_HANDOVER",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
  STALLED = "STALLED",
}

export enum ServiceType {
  HALF = "HALF",
  FULL = "FULL",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  WALLET = "WALLET",
  ONLINE = "ONLINE",
  WALLET_AND_ONLINE = "WALLET_AND_ONLINE",
  PAY_AT_STATION = "PAY_AT_STATION",
  NO_PAYMENT = "NO_PAYMENT",
}

export enum RefundStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
}

export interface VehicleSnapshot {
  vehicleCategoryId: string
  vehicleClassId: string
}

export interface PricingSnapshot {
  basePrice: number
  extraPrice: number
  totalPrice: number
  currency: string
}

export interface ExtraServiceSnapshot {
  serviceId: string
  name: string
  price: number
}

export interface SchedulingDetails {
  timeWindowId: string
  windowStart: Date
  windowEnd: Date
}

export interface WalkInCustomer {
  userId?: string
  name: string
  phone: string
}

export interface WalkInVehicle {
  vehicleId?: string
  registrationNumber: string
  categoryId: string
  classId: string
}

export interface InspectionChecklistItem {
  key: string
  label: string
  passed: boolean
  remark?: string
}

export interface InspectionPhoto {
  position: string
  public_id: string
  secured_url: string
}

export interface InspectionRecord {
  photos: InspectionPhoto[]
  notes?: string
  capturedBy: string
  capturedAt: Date
  checklist?: InspectionChecklistItem[]
}

export interface SettlementSnapshot {
  platformCommission: number
  stationSettlement: number
}

export interface QRDetails {
  qrTokenHash: string
  qrExpiresAt: Date
}

export interface CancellationDetails {
  cancellationReason: string
  cancelledBy: string
  cancelledAt: Date
}

export interface StationDetails {
  name?: string
  city?: string
  phone?: string
}

export interface VehicleDetails {
  nickname?: string
  brand?: string
  model?: string
  registrationNumber?: string
}

export interface CustomerDetails {
  name?: string
  email?: string
  phone?: string
}

export interface StalledDetails {
  stalledReason: string
  stalledBy: string
  stalledAt: Date
  previousStatus: "CHECKED_IN" | "IN_SERVICE"
  resolution?: string
  resolvedBy?: string
  resolvedAt?: Date
}

export interface BookingProps {
  id: string
  bookingNumber: string
  userId?: string | null
  ownerId: string
  stationId: string
  vehicleId?: string | null
  vehicleSnapshot: VehicleSnapshot
  serviceType: ServiceType
  pricingSnapshot: PricingSnapshot
  extraServices: ExtraServiceSnapshot[]
  scheduling: SchedulingDetails
  isWalkIn: boolean
  walkInCustomer?: WalkInCustomer | null
  walkInVehicle?: WalkInVehicle | null
  createdByUserId: string
  qr: QRDetails
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  depositAmount: number
  cashAmount: number
  refundAmount: number
  settlement: SettlementSnapshot
  preServiceInspection?: InspectionRecord | null
  postServiceInspection?: InspectionRecord | null
  status: BookingStatus
  stalledInfo?: StalledDetails | null
  checkedInAt?: Date | null
  checkedInBy?: string | null
  serviceStartedAt?: Date | null
  serviceCompletedAt?: Date | null
  handoverInitiatedAt?: Date | null
  completedAt?: Date | null
  noShowAt?: Date | null
  cancellation?: CancellationDetails | null
  stationDetails?: StationDetails
  vehicleDetails?: VehicleDetails
  customerDetails?: CustomerDetails
  rescheduleCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface BookingStatusLogProps {
  id: string
  bookingId: string
  fromStatus: BookingStatus | null
  toStatus: BookingStatus
  changedBy: string
  reason?: string
  notes?: string
  createdAt: Date
}
