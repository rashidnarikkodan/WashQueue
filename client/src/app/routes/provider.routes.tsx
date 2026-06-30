import ProviderLayout from "../layouts/ProviderLayout";
import { APP_ROUTES } from "../../shared/constants/route.const";

export const providerRoutes = {
  path: APP_ROUTES.PROVIDER.ROOT,
  element: <ProviderLayout />,
  children: [
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
    {
      path: "onboarding",
      element: <>Provider Onboarding</>,
    },
  ],
};