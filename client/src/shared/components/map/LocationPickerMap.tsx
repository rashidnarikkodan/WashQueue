import { useEffect, useRef, useState, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Search, MapPin, Loader2, Navigation, CheckCircle2, Crosshair, Layers, Globe, Moon, Sun } from "lucide-react"

export interface LocationChangeData {
  latitude: number
  longitude: number
  street?: string
  city?: string
  state?: string
  pincode?: string
  district?: string
  country?: string
}

export interface LocationPickerMapProps {
  latitude?: number
  longitude?: number
  onChangeLocation?: (data: LocationChangeData) => void
  readOnly?: boolean
  showSearch?: boolean
  stationName?: string
  className?: string
  height?: string
}

interface SearchSuggestion {
  place_id: number | string
  display_name: string
  lat: number
  lon: number
  address?: {
    road?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    state_district?: string
    state?: string
    postcode?: string
    country?: string
  }
}

export type MapStyleMode = "dark" | "satellite" | "streets"

const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

const MAP_STYLES: Record<MapStyleMode, string | maplibregl.StyleSpecification> = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  satellite: SATELLITE_STYLE,
  streets: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
}

const DEFAULT_CENTER: [number, number] = [76.2711, 10.8505] // Default Kerala / India

export default function LocationPickerMap({
  latitude = 0,
  longitude = 0,
  onChangeLocation,
  readOnly = false,
  showSearch = !readOnly,
  stationName,
  className = "",
  height = "h-80 sm:h-96",
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  const [currentMode, setCurrentMode] = useState<MapStyleMode>("dark")
  const [showStyleMenu, setShowStyleMenu] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Debounced search timer
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Helper for reverse geocoding to auto-fill address details
  const performReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (readOnly || !onChangeLocation) return
      try {
        setIsReverseGeocoding(true)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        )
        if (!res.ok) return
        const data = await res.json()
        if (data && data.address) {
          const addr = data.address
          const street = addr.road || addr.suburb || addr.neighbourhood || ""
          const city = addr.city || addr.town || addr.village || addr.municipality || ""
          const district = addr.state_district || addr.county || ""
          const state = addr.state || ""
          const pincode = addr.postcode || ""
          const country = addr.country || "India"

          onChangeLocation({
            latitude: lat,
            longitude: lng,
            street,
            city,
            district,
            state,
            pincode,
            country,
          })
          setStatusMessage(`Selected: ${data.display_name.split(",").slice(0, 2).join(",")}`)
          setTimeout(() => setStatusMessage(null), 4000)
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err)
      } finally {
        setIsReverseGeocoding(false)
      }
    },
    [onChangeLocation, readOnly]
  )

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const validLat = typeof latitude === "number" && !isNaN(latitude) && latitude !== 0 ? latitude : DEFAULT_CENTER[1]
    const validLng = typeof longitude === "number" && !isNaN(longitude) && longitude !== 0 ? longitude : DEFAULT_CENTER[0]

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.dark,
      center: [validLng, validLat],
      zoom: latitude !== 0 && longitude !== 0 ? 15 : 6,
      attributionControl: false,
    })

    // Add navigation controls (zoom in/out, pitch)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right")

    // Create custom HTML element for pin marker
    const markerEl = document.createElement("div")
    markerEl.className = `location-picker-marker relative group ${readOnly ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}`
    markerEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-2 bg-blue-500/40 rounded-full blur-sm animate-pulse"></div>
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white shadow-2xl flex items-center justify-center text-white transform transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `

    const marker = new maplibregl.Marker({
      element: markerEl,
      draggable: !readOnly,
    })
      .setLngLat([validLng, validLat])
      .addTo(map)

    if (stationName) {
      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(
        `<div style="font-weight:bold; font-size:13px; padding:2px 4px; color:#0f172a;">${stationName}</div>`
      )
      marker.setPopup(popup)
    }

    markerRef.current = marker

    // Marker drag end handler (interactive mode)
    if (!readOnly && onChangeLocation) {
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat()
        const lat = parseFloat(lngLat.lat.toFixed(6))
        const lng = parseFloat(lngLat.lng.toFixed(6))
        onChangeLocation({ latitude: lat, longitude: lng })
        performReverseGeocode(lat, lng)
      })

      // Map click handler (move marker on click)
      map.on("click", (e: maplibregl.MapMouseEvent) => {
        const lat = parseFloat(e.lngLat.lat.toFixed(6))
        const lng = parseFloat(e.lngLat.lng.toFixed(6))
        marker.setLngLat([lng, lat])
        onChangeLocation({ latitude: lat, longitude: lng })
        performReverseGeocode(lat, lng)
      })
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // run once on mount

  // Handle switching map style (Dark / Satellite / Streets)
  const handleStyleChange = (mode: MapStyleMode) => {
    if (!mapRef.current) return
    setCurrentMode(mode)
    setShowStyleMenu(false)

    const map = mapRef.current
    const targetStyle = MAP_STYLES[mode]

    map.setStyle(targetStyle)

    // Ensure marker stays attached on style load
    map.once("style.load", () => {
      if (markerRef.current) {
        markerRef.current.addTo(map)
      }
    })
  }

  // Sync marker position & map center when props change from external updates
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (typeof latitude !== "number" || typeof longitude !== "number" || isNaN(latitude) || isNaN(longitude)) return
    if (latitude === 0 && longitude === 0) return

    const currentLngLat = markerRef.current.getLngLat()
    const isDifferent =
      Math.abs(currentLngLat.lat - latitude) > 0.0001 || Math.abs(currentLngLat.lng - longitude) > 0.0001

    if (isDifferent) {
      markerRef.current.setLngLat([longitude, latitude])
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15, speed: 1.2 })
    }
  }, [latitude, longitude])

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (val.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            val
          )}&limit=5&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        )
        if (res.ok) {
          const data: SearchSuggestion[] = await res.json()
          setSuggestions(data)
          setShowSuggestions(true)
        }
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }

  // Handle Selecting a Search Suggestion
  const handleSelectSuggestion = (sug: SearchSuggestion) => {
    const lat = parseFloat(Number(sug.lat).toFixed(6))
    const lng = parseFloat(Number(sug.lon).toFixed(6))

    setSearchQuery(sug.display_name.split(",")[0])
    setShowSuggestions(false)

    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([lng, lat])
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15, speed: 1.4 })
    }

    if (!readOnly && onChangeLocation) {
      const addr = sug.address || {}
      const street = addr.road || addr.suburb || addr.village || ""
      const city = addr.city || addr.town || addr.village || addr.municipality || ""
      const district = addr.state_district || ""
      const state = addr.state || ""
      const pincode = addr.postcode || ""
      const country = addr.country || "India"

      onChangeLocation({
        latitude: lat,
        longitude: lng,
        street,
        city,
        district,
        state,
        pincode,
        country,
      })
    }

    setStatusMessage(`Location selected: ${sug.display_name.split(",").slice(0, 2).join(",")}`)
    setTimeout(() => setStatusMessage(null), 4000)
  }

  // Recenter map on current location pin
  const handleRecenterPin = () => {
    if (mapRef.current && latitude !== 0 && longitude !== 0) {
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15, speed: 1.2 })
    }
  }

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070D1F] ${className}`}>
      {/* Search Overlay Bar (If enabled) */}
      {showSearch && (
        <div className="absolute top-3 left-3 right-14 sm:right-auto sm:w-80 md:w-96 z-20 flex flex-col gap-1.5">
          <div className="relative flex items-center w-full bg-[#0c1324]/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg shadow-black/40 text-slate-200">
            <div className="pl-3.5 pr-2 text-slate-400">
              {isSearching ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Search size={16} />}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search city, neighborhood, or place..."
              className="w-full bg-transparent py-2.5 pr-4 text-xs sm:text-sm placeholder-slate-400 text-slate-100 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSuggestions([])
                  setShowSuggestions(false)
                }}
                className="pr-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="w-full bg-[#0c1324]/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3.5 py-2.5 border-b border-slate-800/60 last:border-none hover:bg-blue-600/20 transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      {item.display_name.split(",")[0]}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {item.display_name.split(",").slice(1).join(",")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map View / Satellite Switcher Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex flex-col items-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStyleMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0c1324]/90 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-xl cursor-pointer"
            title="Switch Map View"
          >
            <Layers size={15} className="text-blue-400" />
            <span className="capitalize hidden sm:inline">{currentMode} View</span>
          </button>

          {/* Style Options Menu */}
          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-[#0c1324]/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden p-1.5 z-40 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleStyleChange("dark")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                  currentMode === "dark"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Moon size={14} className="text-blue-400" />
                <span>Dark Vector</span>
              </button>

              <button
                type="button"
                onClick={() => handleStyleChange("satellite")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                  currentMode === "satellite"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Globe size={14} className="text-emerald-400" />
                <span>Satellite Imagery</span>
              </button>

              <button
                type="button"
                onClick={() => handleStyleChange("streets")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                  currentMode === "streets"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Sun size={14} className="text-amber-400" />
                <span>Streets Light</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recenter Pin Floating Button */}
      <button
        type="button"
        onClick={handleRecenterPin}
        title="Center map on pin"
        className="absolute bottom-3 left-3 z-20 p-2.5 rounded-xl bg-[#0c1324]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
      >
        <Crosshair size={18} />
      </button>

      {/* Status / Reverse Geocoding Banner */}
      {(isReverseGeocoding || statusMessage) && (
        <div className="absolute bottom-3 left-14 right-16 z-20 flex items-center gap-2 bg-[#0c1324]/90 backdrop-blur-md border border-blue-500/30 rounded-xl px-3 py-1.5 text-xs text-blue-300 shadow-lg animate-fade-in truncate">
          {isReverseGeocoding ? (
            <>
              <Loader2 size={14} className="animate-spin text-blue-400 shrink-0" />
              <span className="truncate">Fetching address details...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </>
          )}
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className={`w-full ${height}`} />

      {/* Map Instructions Badge */}
      {!readOnly && (
        <div className="absolute bottom-3 right-14 z-10 hidden md:flex items-center gap-1.5 bg-[#0c1324]/80 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-300 pointer-events-none">
          <Navigation size={12} className="text-blue-400" />
          <span>Click or drag pin to select station</span>
        </div>
      )}
    </div>
  )
}
