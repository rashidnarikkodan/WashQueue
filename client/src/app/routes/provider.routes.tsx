import ProviderLayout from "../layouts/ProviderLayout";

export const providerRoutes = {
  path: "/provider",
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