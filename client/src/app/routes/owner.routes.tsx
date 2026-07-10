import OwnerLayout from "../layouts/OwnerLayout";
import { APP_ROUTES } from "../../shared/constants/route.const";
import OwnerOnboarding from "@/features/owner/pages/OwnerOnboarding";

export const ownerRoutes = {
  path: APP_ROUTES.OWNER.ROOT,
  element: <OwnerLayout />,
  children: [
    {
      path: "onboarding",
      element: <OwnerOnboarding />,
    },
    {
      path: "dashboard",
      element: <>Dashboard</>,
    },
    {
      path: "queues",
      element: <>Queue Management</>,
    },
    {
      path: "bookings",
      element: <>Bookings</>,
    },
    {
      path: "stations",
      element: <>My Stations</>,
    },
    {
      path: "financial-records",
      element: <>Financial Records</>,
    },
    {
      path: "analytics",
      element: <>Analytics</>,
    },
    {
      path: "feedback",
      element: <>Customer Feedback</>,
    },
    {
      path: "notifications",
      element: <>Notifications</>,
    },
    {
      path: "team",
      element: <>Team & Managers</>,
    },
  ],
};