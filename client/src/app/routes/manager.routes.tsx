/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
const ManagerLayout = lazy(() => import("../layouts/ManagerLayout"))
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"

const StationDetail = lazy(() => import("@/features/station/pages/StationDetails"))
const BookingManagement = lazy(() => import("@/features/booking/pages/BookingManagement"))
const BookingDetails = lazy(() => import("@/features/booking/pages/BookingDetails"))
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
      path: "bookings",
      element: <BookingManagement role="manager" />,
    },
    {
      path: "bookings/:id",
      element: <BookingDetails />,
    },
    {
      path: "queue",
      element: <div>Queue Board</div>,
    },
    {
      path: "walk-ins",
      element: <div>Walk In Management</div>,
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
