import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Navigation, Check, Search } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Loading from "../Loading";

interface LocationSelectorProps {
  className?: string;
}

interface LocationSearchResult {
  place_id?: number;
  display_name: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string | undefined>;
  name?: string;
}

const PRESETS = [
  "Kavanur, Malappuram",
  "Manjeri, Malappuram",
  "Kozhikode, Kerala",
  "Kottakkal, Malappuram",
  "Kochi, Kerala",
  "Perinthalmanna, Malappuram"
];

export default function LocationSelector({ className = "" }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("wq_selected_location") || "Kavanur, Malappuram";
  });
  
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for Nominatim API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "WashQueue-App/1.0"
            }
          }
        );
        setSearchResults(response.data);
      } catch (err) {
        console.error("Failed to query locations:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatLocationName = (result: LocationSearchResult) => {
    const addr = result.address;
    if (!addr) {
      const parts = result.display_name?.split(",");
      return parts?.slice(0, 2).map((p: string) => p.trim()).join(", ");
    }
    const namePart = addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood || addr.road || result.name || "Unknown Location";
    const statePart = addr.state || addr.county || "";
    return statePart ? `${namePart}, ${statePart}` : namePart;
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "en",
                "User-Agent": "WashQueue-App/1.0"
              }
            }
          );
          const data = response.data;
          
          const cleanName = formatLocationName(data) ?? "Unknown Location";
          
          setSelectedLocation(cleanName);
          localStorage.setItem("wq_selected_location", cleanName);
          localStorage.setItem("wq_selected_coordinates", JSON.stringify({ lat: latitude, lon: longitude }));
          toast.success(`Location resolved to ${cleanName}`);
          setIsOpen(false);
          setSearchQuery("");
        } catch (err) {
          toast.error("Failed to resolve address coordinates");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied";
        }
        toast.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleSelectLocation = (locationName: string, lat?: string, lon?: string) => {
    setSelectedLocation(locationName);
    localStorage.setItem("wq_selected_location", locationName);
    if (lat && lon) {
      localStorage.setItem("wq_selected_coordinates", JSON.stringify({ lat, lon }));
    } else {
      localStorage.removeItem("wq_selected_coordinates");
    }
    setIsOpen(false);
    setSearchQuery("");
    toast.success(`Location updated to ${locationName}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors focus:outline-none select-none py-1.5 px-3 rounded-full hover:bg-muted/30 border border-transparent hover:border-border/30 ${className}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="font-semibold truncate max-w-32.5">{selectedLocation}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 lg:left-0 lg:right-auto mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 flex flex-col focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {/* Autocomplete Search Field */}
          <div className="relative p-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search other locations..."
              className="w-full text-xs bg-muted/60 hover:bg-muted/90 focus:bg-background border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 pl-8 pr-3 outline-none transition-all placeholder:text-muted-foreground"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
            {isSearching && (
              <Loading size="sm" className="absolute right-3 top-3" />
            )}
          </div>

          <div className="h-px bg-border my-1.5 px-1"></div>

          {/* Conditional content listing */}
          {searchQuery.trim() ? (
            <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto pr-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Search Results
              </span>
              {isSearching && searchResults.length === 0 ? (
                <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
                  <Loading size="sm" text="Searching..." className="flex-row! gap-2 text-muted-foreground" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center p-4 text-xs text-muted-foreground">
                  No locations found
                </div>
              ) : (
                searchResults.map((result) => {
                  const cleanName = formatLocationName(result) ?? "Unknown Location";
                  const isSelected = selectedLocation === cleanName;
                  return (
                    <button
                      key={result.place_id}
                      onClick={() => handleSelectLocation(cleanName, result.lat, result.lon)}
                      className={`flex items-center justify-between w-full p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer group ${
                        isSelected 
                          ? "bg-primary/10 text-primary font-bold" 
                          : "hover:bg-muted/70 text-muted-foreground hover:text-foreground font-medium"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                        <span className="truncate">{result.display_name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <>
              {/* Use Current Location Button */}
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted text-left text-xs font-semibold text-foreground transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2">
                  {isLocating ? (
                    <Loading size="sm" />
                  ) : (
                    <Navigation className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  )}
                  <span>{isLocating ? "Resolving location..." : "Use Current Location"}</span>
                </div>
              </button>

              <div className="h-px bg-border my-1 px-1"></div>

              {/* Header Label */}
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2.5 py-1">
                Popular Locations
              </span>

              {/* Presets List */}
              <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto pr-0.5">
                {PRESETS.map((location) => {
                  const isSelected = selectedLocation === location;
                  return (
                    <button
                      key={location}
                      onClick={() => handleSelectLocation(location)}
                      className={`flex items-center justify-between w-full p-2 rounded-xl text-left text-xs transition-colors cursor-pointer group ${
                        isSelected 
                          ? "bg-primary/10 text-primary font-bold" 
                          : "hover:bg-muted/70 text-muted-foreground hover:text-foreground font-medium"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                        <span className="truncate">{location}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
