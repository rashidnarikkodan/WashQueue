import { IUser } from "../models/user.model"
import { User } from "../../domain/entities/User"
import { ROLE } from "@/shared/constants/role.constants"

export class UserMapper {
  static toDomain(mongooseDoc: IUser & { 
    isVerified?: boolean; 
    onboardingStep?: number; 
    legalFullName?: string;
    businessName?: string;
    businessType?: string;
    gstNumber?: string;
    whatsapp?: string;
    businessEmail?: string;
    hasStation?: boolean;
    hasMobileService?: boolean;
    mobileActive?: boolean;
    idProofType?: string;
    idProofUrl?: string;
    businessLicenseUrl?: string;
    gstCertificateUrl?: string;
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountType?: string;
    bankProofUrl?: string;
  }): User {
    if (mongooseDoc.role === ROLE.OWNER) {
      const { Owner } = require("../../../owner/domain/entities/Owner")
      return new Owner({
        id: mongooseDoc._id.toString(),
        name: mongooseDoc.name,
        email: mongooseDoc.email,
        phone: mongooseDoc.phone,
        password: mongooseDoc.password,
        role: mongooseDoc.role,
        refreshToken: mongooseDoc.refreshToken,
        lastLoginAt: mongooseDoc.lastLoginAt,
        walletBalance: mongooseDoc.walletBalance,
        avatar: mongooseDoc.avatar,
        authProvider: mongooseDoc.authProvider,
        isBlocked: mongooseDoc.isBlocked,
        createdAt: mongooseDoc.createdAt,
        updatedAt: mongooseDoc.updatedAt,
        
        onboardingStep: mongooseDoc.onboardingStep,
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
        idProofType: mongooseDoc.idProofType,
        idProofUrl: mongooseDoc.idProofUrl,
        businessLicenseUrl: mongooseDoc.businessLicenseUrl,
        gstCertificateUrl: mongooseDoc.gstCertificateUrl,
        accountHolderName: mongooseDoc.accountHolderName,
        bankName: mongooseDoc.bankName,
        accountNumber: mongooseDoc.accountNumber,
        ifscCode: mongooseDoc.ifscCode,
        accountType: mongooseDoc.accountType,
        bankProofUrl: mongooseDoc.bankProofUrl,
      })
    }

    return new User({
      id: mongooseDoc._id.toString(),
      name: mongooseDoc.name,
      email: mongooseDoc.email,
      phone: mongooseDoc.phone,
      password: mongooseDoc.password,
      role: mongooseDoc.role,
      refreshToken: mongooseDoc.refreshToken,
      lastLoginAt: mongooseDoc.lastLoginAt,
      walletBalance: mongooseDoc.walletBalance,
      avatar: mongooseDoc.avatar,
      authProvider: mongooseDoc.authProvider,
      isBlocked: mongooseDoc.isBlocked,
      createdAt: mongooseDoc.createdAt,
      updatedAt: mongooseDoc.updatedAt,
    })
  }

  static toPersistence(domainEntity: Partial<User>): Partial<IUser> {
    const raw: Partial<IUser> = {
      name: domainEntity.name,
      email: domainEntity.email,
      phone: domainEntity.phone,
      password: domainEntity.password,
      role: domainEntity.role,
      refreshToken: domainEntity.refreshToken,
      lastLoginAt: domainEntity.lastLoginAt,
      walletBalance: domainEntity.walletBalance,
      avatar: domainEntity.avatar,
      authProvider: domainEntity.authProvider,
      isBlocked: domainEntity.isBlocked,
    }
    return raw
  }
}
