/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { Navigate } from "react-router-dom"
const OwnerLayout = lazy(() => import("../layouts/OwnerLayout"))
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"
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
      element: <>My Stations</>,
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
