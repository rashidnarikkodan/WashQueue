import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Landing from "../../features/home/pages/Landing";
import Home from "../../features/home/pages/Home";
import { useAuthStore } from "../../features/auth/store/authStore";
import { ROLE } from "../../shared/constants/role.const";

const RootPathResolver = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Landing />;
  }

  switch (user.role) {
    case ROLE.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLE.MANAGER:
      return <Navigate to="/manager/dashboard" replace />;
    case ROLE.PROVIDER:
      return <Navigate to="/provider/dashboard" replace />;
    default:
      return <Home />;
  }
};

export const mainRoutes = {
  path: "/",
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