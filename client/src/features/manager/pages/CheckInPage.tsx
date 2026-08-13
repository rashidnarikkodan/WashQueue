import { useState } from "react"
import { QrCode, PlusCircle } from "lucide-react"
import CheckInComponent from "../components/layouts/CheckInComponent"
import WalkInComponent from "../components/layouts/WalkInComponent"

interface CheckInPageProps {
  defaultTab?: "CHECK_IN" | "WALK_IN"
}

export default function CheckInPage({ defaultTab = "CHECK_IN" }: CheckInPageProps) {
  const [activeTab, setActiveTab] = useState<"CHECK_IN" | "WALK_IN">(defaultTab)

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

      {/* 2. Tab Navigation Pills */}
      <div className="flex items-center gap-4 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("CHECK_IN")}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer border ${
            activeTab === "CHECK_IN"
              ? "bg-primary/10 text-primary border-primary/40 shadow-lg shadow-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <QrCode className="h-4 w-4 text-primary" />
          <span>[ Check-In ]</span>
        </button>

        <button
          onClick={() => setActiveTab("WALK_IN")}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer border ${
            activeTab === "WALK_IN"
              ? "bg-primary/10 text-primary border-primary/40 shadow-lg shadow-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <PlusCircle className="h-4 w-4 text-muted-foreground" />
          <span>[ Walk-In Booking ]</span>
        </button>
      </div>

      {/* 3. Operational Tab Layout Components */}
      {activeTab === "CHECK_IN" ? <CheckInComponent /> : <WalkInComponent />}
    </div>
  )
}
