import { useState } from "react"
import CheckInComponent from "../components/layouts/CheckInComponent"
import WalkInComponent from "../components/layouts/WalkInComponent"
import ScrollableTabs, { type TabItem } from "@/shared/components/ui/ScrollableTabs"

interface CheckInPageProps {
  defaultTab?: "CHECK_IN" | "WALK_IN"
}

export default function CheckInPage({ defaultTab = "CHECK_IN" }: CheckInPageProps) {
  const [activeTab, setActiveTab] = useState<"CHECK_IN" | "WALK_IN">(defaultTab)

  const tabs: TabItem[] = [
    { id: "CHECK_IN", label: "Check-In" },
    { id: "WALK_IN", label: "Walk-In Booking" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Customer Arrival Desk
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          Manage customer arrivals, booking check-ins, and walk-in bookings.
        </p>
      </div>

      {/* 2. Tab Navigation */}
      <ScrollableTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as "CHECK_IN" | "WALK_IN")}
      />

      {/* 3. Operational Tab Layout Components */}
      {activeTab === "CHECK_IN" ? <CheckInComponent /> : <WalkInComponent />}
    </div>
  )
}

