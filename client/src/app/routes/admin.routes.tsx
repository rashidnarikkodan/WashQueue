// src/app/routes/admin.routes.tsx

import AdminLayout from "../layouts/AdminLayout";

export const adminRoutes = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    {
      path: "dashboard",
      element: <div>Admin Dashboard</div>,
    },
    {
      path: "users",
      element: <div>User Management</div>,
    },
    {
      path: "providers",
      element: <div>Provider Management</div>,
    },
  ],
};