import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Navigation, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface LocationSelectorProps {
  className?: string;
}

const PRESETS = [
  "Kavanur, Malappuram",
  "Manjeri, Malappuram",
  "Kozhikode City",
  "Kottakkal, Malappuram",
  "Kochi, Ernakulam",
  "Perinthalmanna, Malappuram"
];

export default function LocationSelector({ className = "" }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Kavanur, Malappuram");
  const [isLocating, setIsLocating] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Simulating reverse-geocoding search with coordinates
        const { latitude, longitude } = position.coords;
        console.log(`Coords: ${latitude}, ${longitude}`);
        
        setTimeout(() => {
          setIsLocating(false);
          setIsOpen(false);
          // Standardize on a nice localized mock name with (GPS) tag
          setSelectedLocation("Manjeri, Malappuram (GPS)");
          toast.success("Location resolved to Manjeri, Malappuram via GPS");
        }, 1200);
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

  const handleSelectPreset = (location: string) => {
    setSelectedLocation(location);
    setIsOpen(false);
    toast.success(`Location updated to ${location}`);
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
        <span className="font-semibold truncate max-w-[130px]">{selectedLocation}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 lg:left-0 lg:right-auto mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 flex flex-col focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {/* Use Current Location Button */}
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted text-left text-xs font-semibold text-foreground transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-2">
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Navigation className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              )}
              <span>{isLocating ? "Locating..." : "Use Current Location"}</span>
            </div>
          </button>

          {/* Divider */}
          <div className="h-[1px] bg-border my-1 px-1"></div>

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
                  onClick={() => handleSelectPreset(location)}
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
        </div>
      )}
    </div>
  );
}
