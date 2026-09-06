import { useEffect, useRef } from "react"
import { Search } from "lucide-react"

interface SearchPillProps {
  onClose: () => void
}

export default function SearchPill({ onClose }: SearchPillProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[450px] md:w-[600px] flex items-center gap-2 border border-primary/50 rounded-full px-4 py-2 bg-background shadow-2xl z-50 animate-in fade-in zoom-in duration-200"
    >
      <input
        type="text"
        placeholder="Search"
        className="bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground w-full px-2"
        autoFocus
      />
      <button className="relative left-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full p-2.5 px-5 flex items-center justify-center transition-colors">
        <Search className="h-4.5 w-4.5" />
      </button>
    </div>
  )
}
