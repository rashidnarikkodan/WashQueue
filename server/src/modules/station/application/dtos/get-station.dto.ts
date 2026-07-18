export interface StationResponseDto {
  id: string
  ownerId: string
  name: string
  description: string
  contactPhone: string
  contactEmail: string
  location?: {
    type: "Point"
    coordinates: [number, number]
  }
  address?: string
  pincode?: string
  city?: string
  state?: string
  images: Array<{
    url: string
    publicId: string
    isPrimary: boolean
  }>
  bays: number
  avgServiceTime: number
  operatingHours: Array<{
    day: string
    open: string
    close: string
    isClosed: boolean
  }>
  holidays: Array<{
    date: Date
    reason: string
  }>
  amenities: string[]
  rating: number
  reviewCount: number
  verifiedAt: Date | null
  rejectionReason: string | null
  status: string
  isActive: boolean
  createdAt: Date
}
