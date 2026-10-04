export interface PlaceSuggestion {
  placeId: string
  mainText: string
  secondaryText: string
}

export interface ResolvedPlace {
  latitude: number
  longitude: number
  description: string
}
