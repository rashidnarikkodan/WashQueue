export interface OwnerProps {
  id?: string
  userId: string
  legalFullName: string
  businessName: string
  businessType: "INDIVIDUAL" | "SOLE_PROP" | "PARTNERSHIP" | "PVT_LTD"
  gstNumber?: string
  whatsapp?: string
  businessEmail?: string
  hasStation: boolean
  hasMobileService: boolean
  mobileActive?: boolean
  isVerified?: boolean
  verifiedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class Owner implements OwnerProps {
  readonly id?: string
  readonly userId: string
  readonly legalFullName: string
  readonly businessName: string
  readonly businessType: "INDIVIDUAL" | "SOLE_PROP" | "PARTNERSHIP" | "PVT_LTD"
  readonly gstNumber?: string
  readonly whatsapp?: string
  readonly businessEmail?: string
  readonly hasStation: boolean
  readonly hasMobileService: boolean
  readonly mobileActive: boolean
  readonly isVerified: boolean
  readonly verifiedAt?: Date
  readonly createdAt?: Date
  readonly updatedAt?: Date

  constructor(props: OwnerProps) {
    this.id = props.id
    this.userId = props.userId
    this.legalFullName = props.legalFullName
    this.businessName = props.businessName
    this.businessType = props.businessType
    this.gstNumber = props.gstNumber
    this.whatsapp = props.whatsapp
    this.businessEmail = props.businessEmail
    this.hasStation = props.hasStation
    this.hasMobileService = props.hasMobileService
    this.mobileActive = props.mobileActive ?? false
    this.isVerified = props.isVerified ?? false
    this.verifiedAt = props.verifiedAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
