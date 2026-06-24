// src/app/routes/auth.routes.tsx

import AuthLayout from "../layouts/AuthLayout";

export const authRoutes = {
  path: "/",
  element: <AuthLayout />,
  children: [
    {
      path: "login",
      element: <div>Signin</div>,
    },
    {
      path: "regitser",
      element: <div>Signup</div>,
    },
    {
      path: "forgot-password",
      element: <div>Forgot Password</div>,
    },
  ],
};