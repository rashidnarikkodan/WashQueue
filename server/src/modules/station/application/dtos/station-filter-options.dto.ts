export interface StationFilterOptionsDTO {
  vehicleCategories: Array<{ id: string; slug: string; name: string }>
  vehicleClasses: Array<{ id: string; categoryId: string; slug: string; name: string }>
  amenities: Array<{ slug: string; name: string; icon: string }>
  priceBounds: {
    minPrice: number
    maxPrice: number
    currency: string
  }
  sortOptions: Array<{ value: string; label: string }>
}
