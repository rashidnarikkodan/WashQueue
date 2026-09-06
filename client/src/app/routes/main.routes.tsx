/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { useAuthStore } from "../../features/auth/store/auth.store"
import { ROLE, VIEW_MODE } from "../../shared/constants/role.const"
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"
import { Navigate } from "react-router-dom"
const MainLayout = lazy(() => import("../layouts/MainLayout"))
const Landing = lazy(() => import("../../features/home/pages/Landing"))
const Home = lazy(() => import("../../features/home/pages/Home"))
const StationDetails = lazy(() => import("../../features/station/pages/StationDetails"))
const StationDiscovery = lazy(() => import("../../features/station/pages/StationDiscovery"))
const VehicleDetails = lazy(() => import("../../features/vehicle/pages/VehicleDetails"))
const ProfilePage = lazy(() => import("../../features/profile/pages/ProfilePage"))
const BookmarksPage = lazy(() => import("../../features/station/pages/BookmarksPage"))
const Booking = lazy(() => import("@/features/booking/pages/Booking"))
const BookingManagement = lazy(() => import("@/features/booking/pages/BookingList"))
const BookingDetails = lazy(() => import("@/features/booking/pages/BookingDetails"))
const WalletPage = lazy(() => import("@/features/wallet/pages/WalletPage"))
const ProtectedRoute = lazy(() => import("./ProtectedRoute"))

const RootPathResolver = () => {
  const { isAuthenticated, user, isLoading, activeViewMode } = useAuthStore()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated || !user) {
    return <Landing />
  }

  if (user && !user.isVerified && user.authProvider === "local") {
    return <Navigate to={APP_ROUTES.AUTH.VERIFY_EMAIL} replace />
  }

  switch (user.role) {
    case ROLE.ADMIN:
      return <Navigate to={APP_ROUTES.ADMIN.DASHBOARD} replace />
    case ROLE.MANAGER:
      if (activeViewMode === VIEW_MODE.CUSTOMER) {
        return <Home />
      }
      return <Navigate to={APP_ROUTES.MANAGER.DASHBOARD} replace />
    case ROLE.OWNER:
      if (
        activeViewMode === VIEW_MODE.CUSTOMER ||
        !user.onboardingStep ||
        user.onboardingStep < 4
      ) {
        return <Home />
      }
      return <Navigate to={APP_ROUTES.OWNER.DASHBOARD} replace />
    default:
      return <Home />
  }
}

export const mainRoutes = {
  path: APP_ROUTES.HOME,
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <RootPathResolver />,
    },
    {
      path: "stations",
      element: <StationDiscovery />,
    },
    {
      path: "stations/:id",
      element: <StationDetails />,
    },
    {
      path: "bookmarks",
      element: (
        <ProtectedRoute>
          <BookmarksPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "favorites",
      element: <Navigate to="/bookmarks" replace />,
    },
    {
      path: "vehicles/:id",
      element: (
        <ProtectedRoute>
          <VehicleDetails />
        </ProtectedRoute>
      ),
    },
    {
      path: "profile",
      element: (
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      ),
    },
    {
      path: "bookings/new",
      element: <Booking />,
    },
    {
      path: "bookings",
      element: (
        <ProtectedRoute>
          <BookingManagement role="customer" />
        </ProtectedRoute>
      ),
    },
    {
      path: "bookings/:id",
      element: (
        <ProtectedRoute>
          <BookingDetails role="customer" />
        </ProtectedRoute>
      ),
    },
    {
      path: "wallet",
      element: (
        <ProtectedRoute>
          <WalletPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "about",
      element: <div>About</div>,
    },
  ],
}
