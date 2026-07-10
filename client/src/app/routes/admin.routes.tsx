import AdminLayout from "../layouts/AdminLayout";
import UserManagement from "../../features/users/pages/UserManagement";
import UserDetails from "../../features/users/pages/UserDetails";
import { APP_ROUTES } from "../../shared/constants/route.const";

export const adminRoutes = {
  path: APP_ROUTES.ADMIN.ROOT,
  element: <AdminLayout />,
  children: [
    {
      path: "dashboard",
      element: <>Dashboard</>,
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
      path: "owners",
      element: <>Owner Verification</>,
    },
    {
      path: "stations",
      element: <>Station Management</>,
    },
    {
      path: "categories",
      element: <>Vehicle Category Management</>,
    },
    {
      path: "bookings",
      element: <>Booking Monitoring</>,
    },
    {
      path: "queues",
      element: <>Queue Monitoring</>,
    },
    {
      path: "reviews",
      element: <>Reviews & Ratings Moderation</>,
    },
    {
      path: "fraud",
      element: <>Fraud Monitoring</>,
    },
    {
      path: "notifications",
      element: <>Notifications Management</>,
    },
    {
      path: "reports",
      element: <>Reports & Analytics</>,
    },
    {
      path: "settings",
      element: <>System Settings</>,
    },
  ],
};