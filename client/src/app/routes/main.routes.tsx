// src/app/routes/main.routes.tsx

import MainLayout from "../layouts/MainLayout";

export const mainRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <div>Home</div>,
    },
    {
      path: "about",
      element: <div>About</div>,
    },
  ],
};