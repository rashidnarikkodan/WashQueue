import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Layers, Globe, Moon, Sun, Crosshair, ArrowRight, X } from "lucide-react"
import type { Station } from "../../types"

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
      attribution: "Tiles &copy; Esri",
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

const DEFAULT_CENTER: [number, number] = [76.2711, 10.8505]

interface StationDiscoveryMapProps {
  stations: Station[]
  userLocation?: { latitude: number; longitude: number } | null
  onStationSelect?: (stationId: string) => void
}

export default function StationDiscoveryMap({
  stations,
  userLocation,
  onStationSelect,
}: StationDiscoveryMapProps) {
  const navigate = useNavigate()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)

  const { resolvedTheme } = useTheme()
  const themeMapStyle: MapStyleMode = resolvedTheme === "light" ? "streets" : "dark"

  const [userSelectedMode, setUserSelectedMode] = useState<MapStyleMode | null>(null)
  const currentMode: MapStyleMode = userSelectedMode ?? themeMapStyle
  const activeStyleRef = useRef<MapStyleMode>(themeMapStyle)

  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const initialLat =
      userLocation?.latitude ||
      stations.find((s) => s.location?.latitude)?.location?.latitude ||
      DEFAULT_CENTER[1]

    const initialLng =
      userLocation?.longitude ||
      stations.find((s) => s.location?.longitude)?.location?.longitude ||
      DEFAULT_CENTER[0]

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[themeMapStyle],
      center: [initialLng, initialLat],
      zoom: userLocation ? 13 : 11,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right")

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [stations, userLocation, themeMapStyle])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const bounds = new maplibregl.LngLatBounds()
    let hasPoints = false

    stations.forEach((station) => {
      const lat = station.location?.latitude
      const lng = station.location?.longitude
      if (!lat || !lng || (lat === 0 && lng === 0)) return

      hasPoints = true
      bounds.extend([lng, lat])

      const el = document.createElement("div")
      el.className = "station-map-marker group cursor-pointer"
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-1.5 bg-blue-500/40 rounded-full blur-sm animate-pulse"></div>
          <div class="px-2.5 py-1 rounded-full bg-slate-900/90 border border-blue-500/50 shadow-xl flex items-center gap-1.5 text-xs font-bold text-white transform transition-transform group-hover:scale-110">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>★ ${station.rating ? station.rating.toFixed(1) : "4.8"}</span>
          </div>
        </div>
      `

      el.addEventListener("mouseenter", () => {
        setSelectedStation(station)
      })

      el.addEventListener("click", (e) => {
        e.stopPropagation()
        setSelectedStation(station)
        onStationSelect?.(station.id)
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 })
        }
      })

      if (!mapRef.current) return

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current)

      markersRef.current.push(marker)
    })

    if (userLocation) {
      bounds.extend([userLocation.longitude, userLocation.latitude])
      hasPoints = true
    }

    if (hasPoints && mapRef.current && stations.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 })
    }
  }, [stations, userLocation, onStationSelect])

  useEffect(() => {
    if (!mapRef.current) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    if (userLocation && userLocation.latitude !== 0 && userLocation.longitude !== 0) {
      const el = document.createElement("div")
      el.className = "user-location-marker"
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-blue-500/40 animate-ping absolute"></div>
          <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
        </div>
      `

      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(mapRef.current)
    }
  }, [userLocation])

  const handleStyleChange = (mode: MapStyleMode) => {
    if (!mapRef.current) return
    setUserSelectedMode(mode)
    setShowStyleMenu(false)
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map || activeStyleRef.current === currentMode) return

    activeStyleRef.current = currentMode
    map.setStyle(MAP_STYLES[currentMode])
    map.once("style.load", () => {
      markersRef.current.forEach((m) => m.addTo(map))
      if (userMarkerRef.current) userMarkerRef.current.addTo(map)
    })
  }, [currentMode])

  const handleRecenterUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        speed: 1.2,
      })
    }
  }

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />

      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStyleMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-xl cursor-pointer"
          >
            <Layers size={15} className="text-primary" />
            <span className="capitalize hidden sm:inline">{currentMode} View</span>
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden p-1.5 z-30 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleStyleChange("dark")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                  currentMode === "dark"
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Moon size={14} className="text-primary" />
                <span>Dark Vector</span>
              </button>

              <button
                type="button"
                onClick={() => handleStyleChange("satellite")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                  currentMode === "satellite"
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Sun size={14} className="text-amber-400" />
                <span>Streets Light</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {userLocation && (
        <button
          type="button"
          onClick={handleRecenterUser}
          title="Center map on your location"
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-xl cursor-pointer"
        >
          <Crosshair size={16} className="text-primary" />
          <span className="hidden sm:inline">My Location</span>
        </button>
      )}

      {selectedStation && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-96 z-30 bg-card/95 backdrop-blur-xl border border-primary/40 rounded-2xl shadow-2xl p-4 transition-all animate-in fade-in slide-in-from-bottom-3">
          <div className="flex gap-3 items-start justify-between">
            <div className="flex gap-3 items-center flex-1 min-w-0">
              <img
                src={
                  selectedStation.images?.find((img) => img.isPrimary)?.url ||
                  selectedStation.images?.[0]?.url ||
                  "https://placehold.co/100x100/1a2240/60a5fa?text=Wash"
                }
                alt={selectedStation.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {selectedStation.name}
                  </h4>
                  <span className="text-xs font-bold text-amber-400 shrink-0 ml-1">
                    ★ {selectedStation.rating?.toFixed(1) || "4.8"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {selectedStation.address?.street || ""}, {selectedStation.address?.city || ""}
                </p>

                <div className="flex items-center gap-3 text-[11px] font-medium text-emerald-400 mt-1">
                  <span>{selectedStation.slotConfig?.bays || 4} Bays</span>
                  {selectedStation.distanceKm !== undefined && (
                    <span className="text-muted-foreground">
                      • {selectedStation.distanceKm} km away
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedStation(null)}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer ml-2 shrink-0"
              title="Close preview"
            >
              <X size={16} />
            </button>
          </div>

          <button
            onClick={() => navigate(`/stations/${selectedStation.id}`)}
            className="w-full mt-3 py-2.5 px-4 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <span>Book Wash Station</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
