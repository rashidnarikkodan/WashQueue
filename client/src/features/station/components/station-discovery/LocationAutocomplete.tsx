import { useEffect, useRef, useState } from "react"
import { Search, X, Loader2, MapPin } from "lucide-react"
import { placesApi, type PlaceSuggestion } from "@/shared/apis"
import { useDebounce } from "@/shared/hooks/useDebounce"

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect: (location: { latitude: number; longitude: number } | null) => void
  placeholder?: string
  className?: string
}

export default function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search station name, city, street...",
  className = "",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const sessionTokenRef = useRef<string>(crypto.randomUUID())
  const skipNextFetchRef = useRef(false)

  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false
      return
    }

    const query = debouncedValue.trim()
    let cancelled = false

    if (query.length < 2) {
      Promise.resolve().then(() => {
        if (cancelled) return
        setSuggestions([])
        setIsOpen(false)
      })
      return () => {
        cancelled = true
      }
    }

    Promise.resolve().then(() => {
      if (!cancelled) setIsFetching(true)
    })

    placesApi
      .autocomplete(query, sessionTokenRef.current)
      .then((results) => {
        if (cancelled) return
        setSuggestions(results)
        setIsOpen(results.length > 0)
        setHighlightedIndex(-1)
      })
      .catch(() => {
        if (cancelled) return
        setSuggestions([])
        setIsOpen(false)
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedValue])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = async (suggestion: PlaceSuggestion) => {
    skipNextFetchRef.current = true
    onChange(suggestion.mainText)
    setIsOpen(false)
    setSuggestions([])
    setIsResolving(true)

    try {
      const resolved = await placesApi.getPlaceLocation(suggestion.placeId, sessionTokenRef.current)
      onLocationSelect({ latitude: resolved.latitude, longitude: resolved.longitude })
    } catch {
      onLocationSelect(null)
    } finally {
      setIsResolving(false)
      sessionTokenRef.current = crypto.randomUUID()
    }
  }

  const handleClear = () => {
    skipNextFetchRef.current = true
    onChange("")
    onLocationSelect(null)
    setSuggestions([])
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[highlightedIndex])
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center w-full">
        <Search className="w-4.5 h-4.5 text-muted-foreground absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-11 pr-10 py-2.5 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {(isFetching || isResolving) && (
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin absolute right-10" />
        )}
        {value && !isFetching && !isResolving && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 top-[calc(100%+6px)] left-0 w-full rounded-2xl bg-card border border-border shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.placeId}>
              <button
                type="button"
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                  highlightedIndex === index ? "bg-muted" : "hover:bg-muted"
                }`}
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {suggestion.mainText}
                  </span>
                  {suggestion.secondaryText && (
                    <span className="text-xs text-muted-foreground truncate">
                      {suggestion.secondaryText}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
