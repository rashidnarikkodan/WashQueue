// src/app/routes/index.tsx

import { createBrowserRouter } from "react-router-dom";

import { authRoutes } from "./auth.routes";
import { mainRoutes } from "./main.routes";
import { providerRoutes } from "./provider.routes";
import { managerRoutes } from "./manager.routes";
import { adminRoutes } from "./admin.routes";

export const router = createBrowserRouter([
  mainRoutes,
  authRoutes,
  providerRoutes,
  managerRoutes,
  adminRoutes,
  {
    path:'*',
    element:( <div>404 Error</div> )
  }
]);