/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { Navigate } from "react-router-dom"
const OwnerLayout = lazy(() => import("../layouts/OwnerLayout"))
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"
import StationManagement from "@/features/station/pages/owner/StationManagement"
import AddStation from "@/features/station/pages/owner/AddStation"
import EditStation from "@/features/station/pages/owner/EditStation"
const StationDetail = lazy(() => import("@/features/station/pages/StationDetails"))
const OwnerOnboarding = lazy(() => import("@/features/owner/pages/OwnerOnboarding"))
const OwnerDashboard = lazy(() => import("@/features/owner/pages/OwnerDashboard"))

export const ownerRoutes = {
  path: APP_ROUTES.OWNER.ROOT,
  element: <OwnerLayout />,
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: "onboarding",
      element: <OwnerOnboarding />,
    },
    {
      path: "dashboard",
      element: <OwnerDashboard />,
    },
    {
      path: "queues",
      element: <>Queue Management</>,
    },
    {
      path: "bookings",
      element: <>Bookings</>,
    },
    {
      path: "stations",
      element: <StationManagement />,
    },
    {
      path: "stations/new",
      element: <AddStation />,
    },
    {
      path: "stations/:stationId/edit",
      element: <EditStation />,
    },
    {
      path: "stations/:stationId",
      element: <StationDetail role="owner"/>,
    },
    {
      path: "financial-records",
      element: <>Financial Records</>,
    },
    {
      path: "analytics",
      element: <>Analytics</>,
    },
    {
      path: "feedback",
      element: <>Customer Feedback</>,
    },
    {
      path: "notifications",
      element: <>Notifications</>,
    },
    {
      path: "team",
      element: <>Team & Managers</>,
    },
  ],
}
