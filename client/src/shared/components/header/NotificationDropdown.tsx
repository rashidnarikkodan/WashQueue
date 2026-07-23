import { useState, useRef, useEffect } from "react"
import {
  Bell,
  Check,
  X,
  Search,
  Trash2,
  Settings,
  Droplets,
  Activity,
  Shield,
  Sparkles,
} from "lucide-react"

interface NotificationItem {
  id: number
  type: "completed" | "progress" | "security" | "promo"
  category: "bookings" | "system"
  title: string
  time: string
  description: string
  descriptionHighlight?: string
  location?: string
  unread: boolean
  image?: string
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "completed",
    category: "bookings",
    title: "Wash Completed",
    time: "2 MINS AGO",
    description: "Your BMW 6i washing is completed at Car city. Ready for pickup!",
    descriptionHighlight: "BMW 6i",
    location: "Car city",
    unread: true,
  },
  {
    id: 2,
    type: "progress",
    category: "bookings",
    title: "Washing in Progress",
    time: "11 MINS AGO",
    description:
      "Tesla Model S is currently being deep cleaned at Downtown Station. Estimated finish in 15m.",
    descriptionHighlight: "Tesla Model S",
    unread: false,
  },
  {
    id: 3,
    type: "security",
    category: "system",
    title: "New Login Detected",
    time: "1 HOUR AGO",
    description:
      "A new login was detected from a Chrome browser on a MacOS device. If this wasn't you, secure your account.",
    unread: false,
  },
  {
    id: 4,
    type: "promo",
    category: "system",
    title: "Weekend Special",
    time: "5 HOURS AGO",
    description:
      "Enjoy premium detailing with our weekend special discount. Valid at all locations through Sunday.",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/9f84e90fb3377eab02eca78a4ec1145f3571a424?width=856",
    unread: false,
  },
]

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "bookings" | "system">("all")

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter & Search Logic
  const filteredNotifications = notifications.filter((n) => {
    // Tab Filter
    if (activeTab === "unread" && !n.unread) return false
    if (activeTab === "bookings" && n.category !== "bookings") return false
    if (activeTab === "system" && n.category !== "system") return false

    // Search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      const matchTitle = n.title.toLowerCase().includes(query)
      const matchDesc = n.description.toLowerCase().includes(query)
      return matchTitle || matchDesc
    }

    return true
  })

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const renderIcon = (item: NotificationItem) => {
    switch (item.type) {
      case "completed":
        return <Droplets className="h-5 w-5 text-primary" />
      case "progress":
        return <Activity className="h-5 w-5 text-emerald-500" />
      case "security":
        return <Shield className="h-5 w-5 text-red-400" />
      case "promo":
        return <Sparkles className="h-5 w-5 text-primary" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getIconBackground = (item: NotificationItem) => {
    switch (item.type) {
      case "completed":
      case "promo":
        return "bg-primary/10"
      case "progress":
        return "bg-emerald-500/10"
      case "security":
        return "bg-red-500/10"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="View notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[450px] md:w-[500px] max-w-[90vw] origin-top-right rounded-2xl border border-border/80 bg-card shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden z-50 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header Section */}
          <div className="flex flex-col p-6 pb-4 gap-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bell className="h-5.5 w-5.5" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
                    title="Mark all as read"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-red-500/80 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
                  title="Close panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus-within:border-primary/50 transition-colors">
              <Search className="h-4.5 w-4.5 text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(["all", "unread", "bookings", "system"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Cards List */}
          <div className="flex-1 overflow-y-auto p-6 py-4 space-y-4 max-h-[450px]">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex flex-col gap-3 rounded-2xl p-4 transition-all duration-200 bg-muted/30 border border-border/40 hover:bg-muted/50 relative overflow-hidden ${
                    n.unread ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon container */}
                    <div className="relative">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${getIconBackground(n)}`}
                      >
                        {renderIcon(n)}
                      </div>
                      {n.unread && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary"></span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{n.title}</h3>
                          {n.type === "progress" && (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                          {n.time}
                        </span>
                      </div>

                      {/* Styled Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.descriptionHighlight ? (
                          <>
                            {n.description.split(n.descriptionHighlight)[0]}
                            <span className="font-semibold text-primary">
                              {n.descriptionHighlight}
                            </span>
                            {n.description.split(n.descriptionHighlight)[1]}
                          </>
                        ) : (
                          n.description
                        )}
                      </p>

                      {/* Promo Image */}
                      {n.image && (
                        <div className="mt-2.5 rounded-xl overflow-hidden h-28 w-full border border-border/60">
                          <img src={n.image} alt={n.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Card Actions */}
                      {n.type === "completed" && (
                        <div className="flex items-center gap-3 pt-2">
                          <button className="px-3.5 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                            View Details
                          </button>
                          <button className="px-3.5 py-1.5 text-xs font-bold bg-muted text-foreground border border-border/80 rounded-lg hover:bg-muted/80 transition-colors">
                            Rate Service
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/45 mb-2 animate-bounce" />
                <p className="text-sm font-medium text-muted-foreground">No notifications found</p>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/20">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
            <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
              <Settings className="h-4 w-4" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
