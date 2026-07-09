import { IOwner } from "../model/owner.model"
import { Owner } from "../../domain/entities/Owner"
import { IMapper } from "@/core/domain/repository.interface"

export class OwnerMapper implements IMapper<Owner, IOwner> {
  static toDomain(mongooseDoc: IOwner): Owner {
    return new Owner({
      id: mongooseDoc._id.toString(),
      userId: mongooseDoc.userId.toString(),
      legalFullName: mongooseDoc.legalFullName,
      businessName: mongooseDoc.businessName,
      businessType: mongooseDoc.businessType,
      gstNumber: mongooseDoc.gstNumber,
      whatsapp: mongooseDoc.whatsapp,
      businessEmail: mongooseDoc.businessEmail,
      hasStation: mongooseDoc.hasStation,
      hasMobileService: mongooseDoc.hasMobileService,
      mobileActive: mongooseDoc.mobileActive,
      isVerified: mongooseDoc.isVerified,
      verifiedAt: mongooseDoc.verifiedAt,
      createdAt: mongooseDoc.createdAt,
      updatedAt: mongooseDoc.updatedAt,
    })
  }

  static toPersistence(domainEntity: Partial<Owner>): Partial<IOwner> {
    const raw: Partial<IOwner> = {}
    if (domainEntity.userId !== undefined) {
      raw.userId = domainEntity.userId as any
    }
    if (domainEntity.legalFullName !== undefined) {
      raw.legalFullName = domainEntity.legalFullName
    }
    if (domainEntity.businessName !== undefined) {
      raw.businessName = domainEntity.businessName
    }
    if (domainEntity.businessType !== undefined) {
      raw.businessType = domainEntity.businessType
    }
    if (domainEntity.gstNumber !== undefined) {
      raw.gstNumber = domainEntity.gstNumber
    }
    if (domainEntity.whatsapp !== undefined) {
      raw.whatsapp = domainEntity.whatsapp
    }
    if (domainEntity.businessEmail !== undefined) {
      raw.businessEmail = domainEntity.businessEmail
    }
    if (domainEntity.hasStation !== undefined) {
      raw.hasStation = domainEntity.hasStation
    }
    if (domainEntity.hasMobileService !== undefined) {
      raw.hasMobileService = domainEntity.hasMobileService
    }
    if (domainEntity.mobileActive !== undefined) {
      raw.mobileActive = domainEntity.mobileActive
    }
    if (domainEntity.isVerified !== undefined) {
      raw.isVerified = domainEntity.isVerified
    }
    if (domainEntity.verifiedAt !== undefined) {
      raw.verifiedAt = domainEntity.verifiedAt
    }
    return raw
  }

  toDomain(raw: IOwner): Owner {
    return OwnerMapper.toDomain(raw)
  }

  toPersistence(entity: Partial<Owner>): Partial<IOwner> {
    return OwnerMapper.toPersistence(entity)
  }
}
