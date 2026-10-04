import WelcomeSection from "../components/homeSections/WelcomeSection"
import ActiveBookingSection from "../components/homeSections/ActiveBookingSection"
import SidebarWidgetsSection from "../components/homeSections/SidebarWidgetsSection"
import GarageSection from "@/features/vehicle/components/GarageSection"
import WalletLoyaltySection from "../components/homeSections/WalletLoyaltySection"

export default function Home() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-16 space-y-8 min-h-screen text-left animate-in fade-in duration-300">
      <WelcomeSection />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-4">
        <ActiveBookingSection />
        <SidebarWidgetsSection />
      </div>

      <GarageSection />

      <WalletLoyaltySection />
    </div>
  )
}
