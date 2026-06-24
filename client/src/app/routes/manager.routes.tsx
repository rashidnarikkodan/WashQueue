// src/app/routes/manager.routes.tsx

import ManagerLayout from "../layouts/ManagerLayout";

export const managerRoutes = {
  path: "/manager",
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