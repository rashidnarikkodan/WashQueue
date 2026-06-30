// src/app/routes/manager.routes.tsx

import ManagerLayout from "../layouts/ManagerLayout";
import { APP_ROUTES } from "../../shared/constants/route.const";

export const managerRoutes = {
  path: APP_ROUTES.MANAGER.ROOT,
  element: <ManagerLayout />,
  children: [
    {
      path: "dashboard",
      element: <div>Manager Dashboard</div>,
    },
    {
      path: "queue",
      element: <div>Queue Board</div>,
    },
    {
      path: "walk-ins",
      element: <div>Walk In Management</div>,
    },
  ],
};