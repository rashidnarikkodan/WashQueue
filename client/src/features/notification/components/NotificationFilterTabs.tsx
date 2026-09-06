import type { NotificationTabType } from "../types"

interface NotificationFilterTabsProps {
  activeTab: NotificationTabType
  onTabChange: (tab: NotificationTabType) => void
}

const TABS: { key: NotificationTabType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "BOOKING", label: "Bookings" },
  { key: "PAYMENT", label: "Payments" },
  { key: "QUEUE", label: "Queue" },
  { key: "SYSTEM", label: "System" },
]

export function NotificationFilterTabs({ activeTab, onTabChange }: NotificationFilterTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
