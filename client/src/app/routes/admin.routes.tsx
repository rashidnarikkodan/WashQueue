// src/app/routes/admin.routes.tsx

import AdminLayout from "../layouts/AdminLayout";
import UserManagement from "../../features/users/pages/UserManagement";
import UserDetails from "../../features/users/pages/UserDetails";

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
      element: <UserManagement />,
    },
    {
      path: "users/:id",
      element: <UserDetails />,
    },
    {
      path: "providers",
      element: <div>Provider Management</div>,
    },
  ],
};