import { Types } from "mongoose"
import {
  Booking,
  BookingProps,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  ServiceType,
} from "../../domain/entities/Booking"
import { IBookingDocument } from "../models/booking.model"

interface PopulatedDoc {
  _id?: Types.ObjectId | string
  name?: string
  brand?: string
  vehicle_model?: string
  nickname?: string
  registrationNumber?: string
  email?: string
  phone?: string
  address?: {
    city?: string
  }
  contact?: {
    phone?: string
  }
  toString: () => string
}

function getIdString(val: unknown): string {
  if (!val) return ""
  if (typeof val === "object" && val !== null && "_id" in val && (val as PopulatedDoc)._id) {
    return (val as PopulatedDoc)._id?.toString() || ""
  }
  if (
    typeof val === "object" &&
    val !== null &&
    "toString" in val &&
    typeof (val as PopulatedDoc).toString === "function"
  ) {
    return (val as PopulatedDoc).toString()
  }
  return String(val)
}

function toObjectId(val: unknown): Types.ObjectId | null {
  if (!val) return null
  const str = String(val).trim()
  if (!str) return null
  return Types.ObjectId.isValid(str) ? new Types.ObjectId(str) : null
}

export class BookingMapper {
  static toDomain(doc: IBookingDocument): Booking {
    const stationObj =
      doc.stationId && typeof doc.stationId === "object" ? (doc.stationId as PopulatedDoc) : null
    const vehicleObj =
      doc.vehicleId && typeof doc.vehicleId === "object" ? (doc.vehicleId as PopulatedDoc) : null
    const userObj =
      doc.userId && typeof doc.userId === "object" ? (doc.userId as PopulatedDoc) : null

    const props: BookingProps = {
      id: doc._id?.toString() || (doc as unknown as { id?: string }).id || "",
      bookingNumber: doc.bookingNumber || "",
      userId: doc.userId ? getIdString(doc.userId) : null,
      providerId: doc.providerId
        ? getIdString(doc.providerId)
        : doc.createdByUserId
          ? doc.createdByUserId.toString()
          : "",
      stationId: doc.stationId ? getIdString(doc.stationId) : "",
      vehicleId: doc.vehicleId ? getIdString(doc.vehicleId) : null,
      stationDetails:
        stationObj && "name" in stationObj
          ? {
              name: stationObj.name,
              city: stationObj.address?.city,
              phone: stationObj.contact?.phone,
            }
          : undefined,
      vehicleDetails:
        vehicleObj && "brand" in vehicleObj
          ? {
              nickname: vehicleObj.nickname,
              brand: vehicleObj.brand,
              model: vehicleObj.vehicle_model,
              registrationNumber: vehicleObj.registrationNumber,
            }
          : undefined,
      customerDetails:
        userObj && "name" in userObj
          ? {
              name: userObj.name,
              email: userObj.email,
              phone: userObj.phone,
            }
          : undefined,
      vehicleSnapshot: {
        vehicleCategoryId: doc.vehicleSnapshot?.vehicleCategoryId
          ? doc.vehicleSnapshot.vehicleCategoryId.toString()
          : "",
        vehicleClassId: doc.vehicleSnapshot?.vehicleClassId
          ? doc.vehicleSnapshot.vehicleClassId.toString()
          : "",
      },
      serviceType: doc.serviceType as ServiceType,
      pricingSnapshot: {
        basePrice: doc.pricingSnapshot?.basePrice ?? 0,
        extraPrice: doc.pricingSnapshot?.extraPrice ?? 0,
        totalPrice: doc.pricingSnapshot?.totalPrice ?? 0,
        currency: doc.pricingSnapshot?.currency || "INR",
      },
      extraServices: (doc.extraServices || []).map((es) => ({
        serviceId: es.serviceId ? es.serviceId.toString() : "",
        name: es.name || "",
        price: es.price || 0,
      })),
      scheduling: {
        timeWindowId: doc.scheduling?.timeWindowId ? doc.scheduling.timeWindowId.toString() : "",
        windowStart: doc.scheduling?.windowStart || new Date(),
        windowEnd: doc.scheduling?.windowEnd || new Date(),
      },
      isWalkIn: Boolean(doc.isWalkIn),
      walkInCustomer: doc.walkInCustomer
        ? {
            userId: doc.walkInCustomer.userId ? doc.walkInCustomer.userId.toString() : undefined,
            name: doc.walkInCustomer.name || "",
            phone: doc.walkInCustomer.phone || "",
          }
        : null,
      walkInVehicle: doc.walkInVehicle
        ? {
            vehicleId: doc.walkInVehicle.vehicleId
              ? doc.walkInVehicle.vehicleId.toString()
              : undefined,
            registrationNumber: doc.walkInVehicle.registrationNumber || "",
            categoryId: doc.walkInVehicle.categoryId ? doc.walkInVehicle.categoryId.toString() : "",
            classId: doc.walkInVehicle.classId ? doc.walkInVehicle.classId.toString() : "",
          }
        : null,
      createdByUserId: doc.createdByUserId ? doc.createdByUserId.toString() : "",
      qr: {
        qrTokenHash: doc.qr?.qrTokenHash || "",
        qrExpiresAt: doc.qr?.qrExpiresAt || new Date(),
      },
      paymentStatus: doc.paymentStatus as PaymentStatus,
      paymentMethod: doc.paymentMethod as PaymentMethod,
      depositAmount: doc.depositAmount ?? 0,
      cashAmount: doc.cashAmount ?? 0,
      refundAmount: doc.refundAmount ?? 0,
      settlement: {
        platformCommission: doc.settlement?.platformCommission ?? 0,
        stationSettlement: doc.settlement?.stationSettlement ?? 0,
      },
      preServiceInspection: doc.preServiceInspection
        ? {
            photos: doc.preServiceInspection.photos || [],
            notes: doc.preServiceInspection.notes,
            capturedBy: doc.preServiceInspection.capturedBy
              ? doc.preServiceInspection.capturedBy.toString()
              : "",
            capturedAt: doc.preServiceInspection.capturedAt || new Date(),
          }
        : null,
      postServiceInspection: doc.postServiceInspection
        ? {
            photos: doc.postServiceInspection.photos || [],
            notes: doc.postServiceInspection.notes,
            capturedBy: doc.postServiceInspection.capturedBy
              ? doc.postServiceInspection.capturedBy.toString()
              : "",
            capturedAt: doc.postServiceInspection.capturedAt || new Date(),
          }
        : null,
      status: doc.status as BookingStatus,
      stalledInfo: doc.stalledInfo
        ? {
            stalledReason: doc.stalledInfo.stalledReason,
            stalledBy: doc.stalledInfo.stalledBy ? doc.stalledInfo.stalledBy.toString() : "",
            stalledAt: doc.stalledInfo.stalledAt || new Date(),
            previousStatus: doc.stalledInfo.previousStatus,
            resolution: doc.stalledInfo.resolution,
            resolvedBy: doc.stalledInfo.resolvedBy ? doc.stalledInfo.resolvedBy.toString() : undefined,
            resolvedAt: doc.stalledInfo.resolvedAt,
          }
        : null,
      checkedInAt: doc.checkedInAt || null,
      checkedInBy: doc.checkedInBy ? doc.checkedInBy.toString() : null,
      serviceStartedAt: doc.serviceStartedAt || null,
      serviceCompletedAt: doc.serviceCompletedAt || null,
      handoverInitiatedAt: doc.handoverInitiatedAt || null,
      completedAt: doc.completedAt || null,
      noShowAt: doc.noShowAt || null,
      cancellation:
        doc.cancellation && (doc.cancellation.cancelledAt || doc.cancellation.cancellationReason)
          ? {
              cancellationReason: doc.cancellation.cancellationReason || "",
              cancelledBy: doc.cancellation.cancelledBy
                ? doc.cancellation.cancelledBy.toString()
                : "",
              cancelledAt: doc.cancellation.cancelledAt || new Date(),
            }
          : null,
      rescheduleCount: doc.rescheduleCount ?? 0,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    }

    return new Booking(props)
  }

  static toPersistence(entity: Booking): Partial<IBookingDocument> {
    const props = entity.getProps()

    const raw: Partial<IBookingDocument> = {
      bookingNumber: props.bookingNumber,
      userId: toObjectId(props.userId),
      providerId:
        toObjectId(props.providerId) || toObjectId(props.createdByUserId) || new Types.ObjectId(),
      stationId: toObjectId(props.stationId) || new Types.ObjectId(),
      vehicleId: toObjectId(props.vehicleId),
      vehicleSnapshot: {
        vehicleCategoryId:
          toObjectId(props.vehicleSnapshot?.vehicleCategoryId) || new Types.ObjectId(),
        vehicleClassId: toObjectId(props.vehicleSnapshot?.vehicleClassId) || new Types.ObjectId(),
      },
      serviceType: props.serviceType,
      pricingSnapshot: {
        basePrice: props.pricingSnapshot.basePrice,
        extraPrice: props.pricingSnapshot.extraPrice,
        totalPrice: props.pricingSnapshot.totalPrice,
        currency: props.pricingSnapshot.currency,
      },
      extraServices: (props.extraServices || [])
        .map((es) => {
          const oid = toObjectId(es.serviceId)
          return oid ? { serviceId: oid, name: es.name, price: es.price } : null
        })
        .filter(
          (es): es is { serviceId: Types.ObjectId; name: string; price: number } => es !== null
        ),
      scheduling: {
        timeWindowId: toObjectId(props.scheduling?.timeWindowId) || new Types.ObjectId(),
        windowStart: props.scheduling?.windowStart || new Date(),
        windowEnd: props.scheduling?.windowEnd || new Date(),
      },
      isWalkIn: props.isWalkIn,
      walkInCustomer: props.walkInCustomer
        ? {
            userId: toObjectId(props.walkInCustomer.userId),
            name: props.walkInCustomer.name || "",
            phone: props.walkInCustomer.phone || "",
          }
        : null,
      walkInVehicle: props.walkInVehicle
        ? {
            vehicleId: toObjectId(props.walkInVehicle.vehicleId),
            registrationNumber: props.walkInVehicle.registrationNumber || "",
            categoryId: toObjectId(props.walkInVehicle.categoryId) || new Types.ObjectId(),
            classId: toObjectId(props.walkInVehicle.classId) || new Types.ObjectId(),
          }
        : null,
      createdByUserId: toObjectId(props.createdByUserId) || new Types.ObjectId(),
      qr: {
        qrTokenHash: props.qr.qrTokenHash,
        qrExpiresAt: props.qr.qrExpiresAt,
      },
      paymentStatus: props.paymentStatus,
      paymentMethod: props.paymentMethod,
      depositAmount: props.depositAmount,
      cashAmount: props.cashAmount,
      refundAmount: props.refundAmount,
      settlement: {
        platformCommission: props.settlement.platformCommission,
        stationSettlement: props.settlement.stationSettlement,
      },
      status: props.status,
      checkedInAt: props.checkedInAt || null,
      checkedInBy: toObjectId(props.checkedInBy),
      serviceStartedAt: props.serviceStartedAt || null,
      serviceCompletedAt: props.serviceCompletedAt || null,
      handoverInitiatedAt: props.handoverInitiatedAt || null,
      completedAt: props.completedAt || null,
      noShowAt: props.noShowAt || null,
      cancellation: props.cancellation
        ? {
            cancellationReason: props.cancellation.cancellationReason || "",
            cancelledBy:
              toObjectId(props.cancellation.cancelledBy) ||
              toObjectId(props.userId) ||
              toObjectId(props.createdByUserId) ||
              new Types.ObjectId(),
            cancelledAt: props.cancellation.cancelledAt || new Date(),
          }
        : null,
      rescheduleCount: props.rescheduleCount ?? 0,
    }

    return raw
  }
}
