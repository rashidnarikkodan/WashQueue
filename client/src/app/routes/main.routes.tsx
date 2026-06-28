import MainLayout from "../layouts/MainLayout";
import Landing from "../../features/home/pages/Landing";
import Home from "../../features/home/pages/Home";
import { useAuthStore } from "../../features/auth/store/authStore";

const RootPathResolver = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Home /> : <Landing />;
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