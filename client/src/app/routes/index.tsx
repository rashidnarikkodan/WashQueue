// src/app/routes/index.tsx

import { createBrowserRouter } from "react-router-dom";

import { authRoutes } from "./auth.routes";
import { mainRoutes } from "./main.routes";
import { providerRoutes } from "./provider.routes";
import { managerRoutes } from "./manager.routes";
import { adminRoutes } from "./admin.routes";
import ErrorBoundary from "../../shared/pages/ErrorBoundary";

export const router = createBrowserRouter([
  {
    ...mainRoutes,
    errorElement: <ErrorBoundary />,
  },
  {
    ...authRoutes,
    errorElement: <ErrorBoundary />,
  },
  {
    ...providerRoutes,
    errorElement: <ErrorBoundary />,
  },
  {
    ...managerRoutes,
    errorElement: <ErrorBoundary />,
  },
  {
    ...adminRoutes,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: ( <div>404 Error</div> ),
    errorElement: <ErrorBoundary />,
  }
]);