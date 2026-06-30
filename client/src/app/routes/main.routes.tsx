import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Landing from "../../features/home/pages/Landing";
import Home from "../../features/home/pages/Home";
import { useAuthStore } from "../../features/auth/store/authStore";
import { ROLE } from "../../shared/constants/role.const";
import { APP_ROUTES } from "../../shared/constants/route.const";

const RootPathResolver = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Landing />;
  }

  switch (user.role) {
    case ROLE.ADMIN:
      return <Navigate to={APP_ROUTES.ADMIN.DASHBOARD} replace />;
    case ROLE.MANAGER:
      return <Navigate to={APP_ROUTES.MANAGER.DASHBOARD} replace />;
    case ROLE.PROVIDER:
      return <Navigate to={APP_ROUTES.PROVIDER.DASHBOARD} replace />;
    default:
      return <Home />;
  }
};

export const mainRoutes = {
  path: APP_ROUTES.HOME,
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <RootPathResolver />,
    },
    {
      path: "about",
      element: <div>About</div>,
    },
  ],
};