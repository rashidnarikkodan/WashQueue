export interface IOwnerOnboardingDetails {
  fullName?: string
  phone?: string
  whatsapp?: string
  businessName?: string
  businessType?: string
  gstNumber?: string
  idProofType?: string
  idProofUrl?: string
  businessLicenseUrl?: string
  gstCertificateUrl?: string
  accountHolderName?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  bankProofUrl?: string
  businessEmail?: string
  rejectionReason?: string
}

export interface ISaveOnboardingStepUseCase {
  execute(
    userId: string,
    step: number,
    details: IOwnerOnboardingDetails
  ): Promise<{
    step: number
    details: IOwnerOnboardingDetails
    isSubmitted: boolean
    tokens?: { accessToken: string; refreshToken: string }
  }>
}

export interface IGetOnboardingStatusUseCase {
  execute(userId: string): Promise<{
    step: number
    details: IOwnerOnboardingDetails
    isSubmitted: boolean
  }>
}

export interface ISubmitOnboardingUseCase {
  execute(userId: string): Promise<{
    success: boolean
    message: string
    tokens: { accessToken: string; refreshToken: string }
  }>
}

import { Owner } from "../../domain/entities/Owner"
import { CreateOwnerInput } from "../dto/create-owner.dto"
import { UpdateOwnerInput } from "../dto/update-owner.dto"
import { ApproveOwnerInput } from "../dto/approve-owner.dto"

export interface ICreateOwnerUseCase {
  execute(input: CreateOwnerInput): Promise<Owner>
}

export interface IGetOwnerUseCase {
  execute(userId: string): Promise<Owner | null>
}

export interface IUpdateOwnerUseCase {
  execute(userId: string, input: UpdateOwnerInput): Promise<Owner | null>
}

export interface IApproveOwnerUseCase {
  execute(input: ApproveOwnerInput): Promise<Owner>
}
