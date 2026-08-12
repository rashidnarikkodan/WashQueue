/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
const ManagerLayout = lazy(() => import("../layouts/ManagerLayout"))
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"

const StationDetail = lazy(() => import("@/features/station/pages/StationDetails"))
const BookingManagement = lazy(() => import("@/features/booking/pages/BookingList"))
const BookingDetails = lazy(() => import("@/features/booking/pages/BookingDetails"))
const ManagerQueuePage = lazy(() => import("@/features/manager/pages/ManagerQueuePage"))
const ManagerCheckInPage = lazy(() => import("@/features/manager/pages/ManagerCheckInPage"))
const ManagerWalkInPage = lazy(() => import("@/features/manager/pages/ManagerWalkInPage"))
const ManagerPreInspectionPage = lazy(() => import("@/features/manager/pages/ManagerPreInspectionPage"))
const ManagerPostInspectionPage = lazy(() => import("@/features/manager/pages/ManagerPostInspectionPage"))
import AddEditStation from "@/features/station/pages/AddEditStation"

export const managerRoutes = {
  path: APP_ROUTES.MANAGER.ROOT,
  element: <ManagerLayout />,
  children: [
    {
      path: "dashboard",
      element: <div>Manager Dashboard</div>,
    },
    {
      path: "check-in",
      element: <ManagerCheckInPage />,
    },
    {
      path: "bookings",
      element: <BookingManagement role="manager" />,
    },
    {
      path: "bookings/:id",
      element: <BookingDetails />,
    },
    {
      path: "bookings/:id/inspection",
      element: <ManagerPreInspectionPage />,
    },
    {
      path: "bookings/:id/post-inspection",
      element: <ManagerPostInspectionPage />,
    },
    {
      path: "pre-inspection",
      element: <ManagerPreInspectionPage />,
    },
    {
      path: "post-inspection",
      element: <ManagerPostInspectionPage />,
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
      path: "walk-ins",
      element: <ManagerWalkInPage />,
    },
    {
      path: "station",
      element: <StationDetail role="manager" />,
    },
    {
      path: "station/:stationId",
      element: <StationDetail role="manager" />,
    },
    {
      path: "station/:stationId/edit",
      element: <AddEditStation />,
    },
  ],
}
