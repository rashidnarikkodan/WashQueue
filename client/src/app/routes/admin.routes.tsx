/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
const AdminLayout = lazy(() => import("../layouts/AdminLayout"))
const UserManagement = lazy(() => import("../../features/users/pages/UserManagement"))
const UserDetails = lazy(() => import("../../features/users/pages/UserDetails"))
const OwnerApproval = lazy(() => import("../../features/users/pages/OwnerApproval"))
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"
const VehicleCatelog = lazy(() => import("@/features/vehicle-catelog/pages/VehicleCatelog"))
const StationManagementAdmin = lazy(() => import("../../features/station/pages/StationManagementAdmin"))

export const adminRoutes = {
  path: APP_ROUTES.ADMIN.ROOT,
  element: <AdminLayout />,
  children: [
    {
      path: "dashboard",
      element: <>Dashboard</>,
    },
    {
      path: "users",
      element: <UserManagement />,
    },
    {
      path: "users/:id",
      element: <UserDetails />,
    },
    {
      path: "owners",
      element: <OwnerApproval />,
    },
    {
      path: "stations",
      element: <StationManagementAdmin />,
    },
    {
      path: "categories",
      element: <VehicleCatelog/>,
    },
    {
      path: "bookings",
      element: <>Booking Monitoring</>,
    },
    {
      path: "queues",
      element: <>Queue Monitoring</>,
    },
    {
      path: "reviews",
      element: <>Reviews & Ratings Moderation</>,
    },
    {
      path: "fraud",
      element: <>Fraud Monitoring</>,
    },
    {
      path: "notifications",
      element: <>Notifications Management</>,
    },
    {
      path: "reports",
      element: <>Reports & Analytics</>,
    },
    {
      path: "settings",
      element: <>System Settings</>,
    },
  ],
}
