import { useState } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import CheckInComponent from "../components/layouts/CheckInComponent"
import WalkInComponent from "../components/layouts/WalkInComponent"
import ScrollableTabs, { type TabItem } from "@/shared/components/ui/ScrollableTabs"

interface CheckInPageProps {
  defaultTab?: "CHECK_IN" | "WALK_IN"
}

interface CheckInPageLocationState {
  tab?: "CHECK_IN" | "WALK_IN"
  bookingNumber?: string
}

export default function CheckInPage({ defaultTab = "CHECK_IN" }: CheckInPageProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const locationState = location.state as CheckInPageLocationState | null | undefined

  const queryTab = searchParams.get("tab")?.toUpperCase()
  const resolvedTab: "CHECK_IN" | "WALK_IN" =
    queryTab === "WALK_IN" || queryTab === "CHECK_IN"
      ? queryTab
      : locationState?.bookingNumber ||
          searchParams.get("bookingNumber") ||
          searchParams.get("bookingId")
        ? "CHECK_IN"
        : locationState?.tab || defaultTab

  const [userSelectedTab, setUserSelectedTab] = useState<"CHECK_IN" | "WALK_IN" | null>(null)
  const activeTab = userSelectedTab ?? resolvedTab

  const tabs: TabItem[] = [
    { id: "CHECK_IN", label: "Check-In" },
    { id: "WALK_IN", label: "Walk-In Booking" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Customer Arrival Desk
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          Manage customer arrivals, booking check-ins, and walk-in bookings.
        </p>
      </div>

      <ScrollableTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setUserSelectedTab(tabId as "CHECK_IN" | "WALK_IN")}
      />

      {activeTab === "CHECK_IN" ? <CheckInComponent /> : <WalkInComponent />}
    </div>
  )
}
