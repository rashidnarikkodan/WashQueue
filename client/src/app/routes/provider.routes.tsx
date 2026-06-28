// src/app/routes/provider.routes.tsx

import ProviderLayout from "../layouts/ProviderLayout";

export const providerRoutes = {
  path: "/provider",
  element: <ProviderLayout />,
  children: [
    {
      path: "dashboard",
      element: <div>Provider Dashboard</div>,
    },
    {
      path: "onboarding",
      element: <div>Provider Onboarding</div>,
    },
    {
      path: "stations",
      element: <div>Stations</div>,
    },
    {
      path: "bookings",
      element: <div>Bookings</div>,
    },
  ],
};