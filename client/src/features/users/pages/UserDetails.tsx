import { useState, useEffect } from "react"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { ROLE } from "../../../shared/constants/role.const"
import Breadcrumbs from "../../../shared/components/ui/Breadcrumbs"
import { usersApi } from "@/shared/apis/users.api"
import type { User, Booking, Vehicle, OwnerStation } from "../types"
import ConfirmationModal from "../../../shared/components/ui/ConfirmationModal"
import { toast } from "sonner"
import { getErrorMessage } from "../../../shared/utils/error"
import Loading from "../../../shared/components/ui/Loading"

// Import sub-components
import UserDetailsHeader from "../components/ui/UserDetailsHeader"
import PersonalInformationCard from "../components/ui/PersonalInformationCard"
import BookingHistoryCard from "../components/ui/BookingHistoryCard"
import RegisteredVehiclesCard from "../components/ui/RegisteredVehiclesCard"
import LoyaltyTierCard from "../components/ui/LoyaltyTierCard"
import QuickNotificationCard from "../components/ui/QuickNotificationCard"
import OwnerProfileOverviewCard from "../components/ui/OwnerProfileOverviewCard"
import FeatureLock from "@/shared/components/ui/FeatureLock"

// Mock generators based on userId
const getMockBookings = (userId: string): Booking[] => {
  return [
    {
      id: `BK-${userId.slice(-4).toUpperCase()}-01`,
      stationName: "Express Shine Auto Wash",
      vehicle: "Tesla Model 3 (KA-03-MM-1234)",
      date: "2026-07-14",
      amount: 25.0,
      status: "COMPLETED",
    },
    {
      id: `BK-${userId.slice(-4).toUpperCase()}-02`,
      stationName: "Elite Detailers Club",
      vehicle: "Tesla Model 3 (KA-03-MM-1234)",
      date: "2026-07-15",
      amount: 60.0,
      status: "PENDING",
    },
    {
      id: `BK-${userId.slice(-4).toUpperCase()}-03`,
      stationName: "Eco Clean Waterless",
      vehicle: "BMW 5 Series (KA-01-AB-9999)",
      date: "2026-07-10",
      amount: 40.0,
      status: "CANCELLED",
    },
  ]
}

const getMockVehicles = (userId: string): Vehicle[] => {
  return [
    {
      id: `VH-${userId.slice(-4).toUpperCase()}-1`,
      name: "Tesla Model 3 (Deep Blue Metallic)",
      plate: "KA-03-MM-1234",
      addedDate: "2026-07-01",
    },
    {
      id: `VH-${userId.slice(-4).toUpperCase()}-2`,
      name: "BMW 5 Series (Alpine White)",
      plate: "KA-01-AB-9999",
      addedDate: "2026-07-05",
    },
  ]
}

const getMockStations = (): OwnerStation[] => {
  return [
    {
      name: "Express Shine Auto Wash",
      location: "Indiranagar, Bangalore",
      status: "ONLINE",
      sessions: 142,
    },
    {
      name: "Elite Detailers Club",
      location: "Koramangala, Bangalore",
      status: "ONLINE",
      sessions: 98,
    },
    {
      name: "Eco Clean Waterless",
      location: "HSR Layout, Bangalore",
      status: "MAINTENANCE",
      sessions: 35,
    },
  ]
}

const UserDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Core API State
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Block/Activation Action State
  const [isSuspending, setIsSuspending] = useState(false)
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false)

  // Dynamic Data Lists (populated using mock generators based on fetched user)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [ownerStations, setOwnerStations] = useState<OwnerStation[]>([])

  // Fetch actual user from server on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return
      setIsLoading(true)
      setErrorMsg(null)
      try {
        const fetched = await usersApi.getUser(id)
        setUser(fetched)

        // Populate lists dynamically so user details don't show empty fallbacks
        setVehicles(getMockVehicles(fetched.id))
        setBookings(getMockBookings(fetched.id))
        setOwnerStations(getMockStations())
      } catch (err: unknown) {
        setErrorMsg(getErrorMessage(err, "Failed to load user details"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loading size="lg" text="Loading user details..." />
      </div>
    )
  }

  if (errorMsg || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Retrieval Failed</h2>
          <p className="text-muted-foreground text-sm">
            {errorMsg || "Unable to display details for this user."}
          </p>
        </div>
      </div>
    )
  }

  const handleToggleBlockStatus = () => {
    setIsBlockConfirmOpen(true)
  }

  const executeToggleBlockStatus = async () => {
    setIsBlockConfirmOpen(false)
    if (!user) return
    setIsSuspending(true)
    try {
      const updatedBlocked = !user.isBlocked
      const updatedUser = await usersApi.updateUser(user.id, { isBlocked: updatedBlocked })
      setUser(updatedUser)
      toast.success(
        updatedBlocked
          ? `User ${user.name || user.email} suspended successfully!`
          : `User ${user.name || user.email} activated successfully!`
      )
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update block status."))
    } finally {
      setIsSuspending(false)
    }
  }

  const handleScrollToNotification = () => {
    const element = document.getElementById("quick-notification-form")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      toast.info("Scrolled to Quick Notification form.")
    }
  }

  return (
    <div className="space-y-6 max-w-7xl xl:max-w-350 mx-auto px-4 sm:px-6 pb-12 text-[#f8fafc]">
      {/* Breadcrumbs Row & Back Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Breadcrumbs
          items={[
            { label: "Admin", path: "/admin/dashboard" },
            { label: "Users", path: "/admin/users" },
            { label: user.name || user.email },
          ]}
        />

        <button
          onClick={() => navigate("/admin/users")}
          className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Users List</span>
        </button>
      </div>

      {/* 1. Profile Banner Header Card */}
      <UserDetailsHeader
        user={user}
        isSuspending={isSuspending}
        onToggleBlock={handleToggleBlockStatus}
        onScrollToNotification={handleScrollToNotification}
      />

      {/* 2. Grid Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left Side: Personal Info, Bookings, Owner Profile (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          <PersonalInformationCard user={user} />

          <BookingHistoryCard bookings={bookings} />

          <RegisteredVehiclesCard vehicles={vehicles} />

          {/* Conditional Card: Owner Profile details */}
          {(user.role === ROLE.OWNER || user.role === ROLE.MANAGER) && (
            <OwnerProfileOverviewCard user={user} stations={ownerStations} />
          )}
        </div>

        {/* Right Side: Notification Form & Loyalty (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">
          <QuickNotificationCard userEmail={user.email} userName={user.name || "User"} />

          <FeatureLock message="Loyalty Tier">
            <LoyaltyTierCard />
          </FeatureLock>
        </div>
      </div>

      {/* Account Block Confirmation Modal */}
      <ConfirmationModal
        isOpen={isBlockConfirmOpen}
        onClose={() => setIsBlockConfirmOpen(false)}
        onConfirm={executeToggleBlockStatus}
        title={user.isBlocked ? "Activate User Account?" : "Suspend User Account?"}
        message={
          user.isBlocked
            ? `Are you sure you want to activate the account for ${user.name || user.email}? They will be allowed to log in and use all service functions.`
            : `Are you sure you want to suspend the account for ${user.name || user.email}? They will be immediately logged out and blocked from accessing the application.`
        }
        confirmText={user.isBlocked ? "Activate Account" : "Suspend Account"}
        cancelText="Cancel"
        confirmVariant={user.isBlocked ? "success" : "danger"}
      />
    </div>
  )
}

export default UserDetails
