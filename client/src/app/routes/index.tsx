/* eslint-disable react-refresh/only-export-components */

import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"

import { authRoutes } from "./auth.routes"
import { mainRoutes } from "./main.routes"
import { ownerRoutes } from "./owner.routes"
import { managerRoutes } from "./manager.routes"
import { adminRoutes } from "./admin.routes"
import ErrorBoundary from "../../shared/pages/ErrorBoundary"
import Loading from "../../shared/components/ui/Loading"

const NotFoundPage = lazy(() => import("../../shared/pages/NotFoundPage"))

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
    ...ownerRoutes,
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
    path: "*",
    element: (
      <Suspense fallback={<Loading fullScreen />}>
        <NotFoundPage />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
])
