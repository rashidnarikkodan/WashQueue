const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined

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

export const placesApi = {
  async autocomplete(input: string, sessionToken: string): Promise<PlaceSuggestion[]> {
    if (!PLACES_API_KEY || !input.trim()) return []

    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": PLACES_API_KEY,
      },
      body: JSON.stringify({ input, sessionToken }),
    })

    if (!res.ok) {
      throw new Error("Failed to fetch location suggestions")
    }

    interface AutocompleteApiResponse {
      suggestions?: Array<{
        placePrediction?: {
          placeId: string
          text?: { text?: string }
          structuredFormat?: {
            mainText?: { text?: string }
            secondaryText?: { text?: string }
          }
        }
      }>
    }

    const data: AutocompleteApiResponse = await res.json()
    return (data.suggestions || [])
      .filter((s) => Boolean(s.placePrediction))
      .map((s) => {
        const prediction = s.placePrediction!
        return {
          placeId: prediction.placeId,
          mainText: prediction.structuredFormat?.mainText?.text || prediction.text?.text || "",
          secondaryText: prediction.structuredFormat?.secondaryText?.text || "",
        }
      })
  },

  async getPlaceLocation(placeId: string, sessionToken: string): Promise<ResolvedPlace> {
    if (!PLACES_API_KEY) {
      throw new Error("Google Places API key is not configured")
    }

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress&sessionToken=${sessionToken}`,
      { headers: { "X-Goog-Api-Key": PLACES_API_KEY } }
    )

    if (!res.ok) {
      throw new Error("Failed to resolve the selected location")
    }

    const data = await res.json()
    return {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      description: data.formattedAddress,
    }
  },
}
