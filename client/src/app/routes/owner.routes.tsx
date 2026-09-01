/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"
import { Navigate } from "react-router-dom"
const ManagerQueuePage = lazy(() => import("@/features/queue/pages/QueueManagementPage"))
const AddEditStation = lazy(() => import("@/features/station/pages/AddEditStation"))
const OwnerLayout = lazy(() => import("../layouts/OwnerLayout"))
const StationManagement = lazy(() => import("@/features/station/pages/StationManagement"))
const StationDetail = lazy(() => import("@/features/station/pages/StationDetails"))
const OwnerOnboarding = lazy(() => import("@/features/owner/pages/OwnerOnboarding"))
const OwnerDashboard = lazy(() => import("@/features/owner/pages/OwnerDashboard"))
const BookingManagement = lazy(() => import("@/features/booking/pages/BookingList"))
const BookingDetails = lazy(() => import("@/features/booking/pages/BookingDetails"))
const CheckInPage = lazy(() => import("@/features/queue/pages/CheckInPage"))
const OwnerPreInspectionPage = lazy(() => import("@/features/queue/pages/PreInspectionPage"))
const OwnerPostInspectionPage = lazy(() => import("@/features/queue/pages/PostInspectionPage"))
const OwnerFinancialRecords = lazy(() => import("@/features/owner/pages/OwnerFinancialRecords"))

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
      path: "queue",
      element: <ManagerQueuePage />,
    },
    {
      path: "queues",
      element: <ManagerQueuePage />,
    },
    {
      path: "check-in",
      element: <CheckInPage />,
    },
    {
      path: "walk-ins",
      element: <CheckInPage defaultTab="WALK_IN" />,
    },
    {
      path: "pre-inspection",
      element: <OwnerPreInspectionPage />,
    },
    {
      path: "post-inspection",
      element: <OwnerPostInspectionPage />,
    },
    {
      path: "bookings",
      element: <BookingManagement role="owner" />,
    },
    {
      path: "bookings/:id",
      element: <BookingDetails role="owner" />,
    },
    {
      path: "bookings/:id/pre-inspection",
      element: <OwnerPreInspectionPage />,
    },
    {
      path: "bookings/:id/post-inspection",
      element: <OwnerPostInspectionPage />,
    },
    {
      path: "stations",
      element: <StationManagement />,
    },
    {
      path: "stations/new",
      element: <AddEditStation />,
    },
    {
      path: "stations/:stationId/edit",
      element: <AddEditStation />,
    },
    {
      path: "stations/:stationId",
      element: <StationDetail role="owner" />,
    },
    {
      path: "financial-records",
      element: <OwnerFinancialRecords />,
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
  ],
}
