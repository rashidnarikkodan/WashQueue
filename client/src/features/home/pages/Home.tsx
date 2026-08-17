import WelcomeSection from "../components/homeSections/WelcomeSection"
import ActiveBookingSection from "../components/homeSections/ActiveBookingSection"
import SidebarWidgetsSection from "../components/homeSections/SidebarWidgetsSection"
import GarageSection from "@/features/vehicle/components/GarageSection"
import WalletLoyaltySection from "../components/homeSections/WalletLoyaltySection"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-10 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <WelcomeSection />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          <ActiveBookingSection />
          <SidebarWidgetsSection />
        </div>

        <GarageSection />

        <WalletLoyaltySection />
      </div>
    </div>
  )
}
