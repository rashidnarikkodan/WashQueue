import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE, VIEW_MODE, type RoleType } from "@/shared/constants/role.const"
import MyBookingsPage from "./MyBookingsPage"
import BookingManagementPage from "./BookingManagementPage"

interface BookingListProps {
  role?: RoleType
}

export default function BookingList({ role: propRole }: BookingListProps) {
  const location = useLocation()
  const { user, activeViewMode } = useAuthStore()

  // Determine role based on URL route, activeViewMode toggle, propRole, and user role
  const currentRole: RoleType = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return ROLE.ADMIN

    if (activeViewMode === VIEW_MODE.CUSTOMER) return ROLE.CUSTOMER
    if (activeViewMode === VIEW_MODE.MANAGER) return ROLE.MANAGER
    if (activeViewMode === VIEW_MODE.OWNER) return ROLE.OWNER

    if (propRole) return propRole
    if (location.pathname.startsWith("/owner")) return ROLE.OWNER
    if (location.pathname.startsWith("/manager")) return ROLE.MANAGER

    return user?.role ? (user.role as RoleType) : ROLE.CUSTOMER
  }, [propRole, location.pathname, user?.role, activeViewMode])

  const isCustomer = currentRole === ROLE.CUSTOMER

  if (isCustomer) {
    return <MyBookingsPage />
  }

  return <BookingManagementPage role={currentRole} />
}
