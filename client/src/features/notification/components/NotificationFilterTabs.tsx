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
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 capitalize whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
