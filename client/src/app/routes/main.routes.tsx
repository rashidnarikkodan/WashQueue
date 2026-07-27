import { lazy } from "react"
/* eslint-disable react-refresh/only-export-components */
import { Navigate } from "react-router-dom"
const MainLayout = lazy(() => import("../layouts/MainLayout"))
const Landing = lazy(() => import("../../features/home/pages/Landing"))
const Home = lazy(() => import("../../features/home/pages/Home"))
const StationDetails = lazy(() => import("../../features/station/pages/StationDetails"))
const StationDiscovery = lazy(() => import("../../features/station/pages/StationDiscovery"))
const VehicleDetails = lazy(() => import("../../features/vehicle/pages/VehicleDetails"))
const ProfilePage = lazy(() => import("../../features/profile/pages/ProfilePage"))
import { useAuthStore } from "../../features/auth/store/auth.store"
import { ROLE, VIEW_MODE } from "../../shared/constants/role.const"
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"

const RootPathResolver = () => {
  const { isAuthenticated, user, isLoading, activeViewMode } = useAuthStore()

  if (isLoading) {
    return null // wait for session check before deciding which page to show
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
      path: "vehicles/:id",
      element: <VehicleDetails />,
    },
    {
      path: "profile",
      element: <ProfilePage />,
    },
    {
      path: "about",
      element: <div>About</div>,
    },
  ],
}
