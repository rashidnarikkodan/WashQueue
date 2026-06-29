import AuthLayout from "../layouts/AuthLayout";
import AuthPage from "../../features/auth/pages/AuthPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import OTPPage from "../../features/auth/pages/OTPPage";
import SetupAccountPage from "../../features/auth/pages/SetupAccountPage";

export const authRoutes = {
  path: "/",
  element: <AuthLayout />,
  children: [
    {
      path: "login",
      element: <AuthPage />,
    },
    {
      path: "signup",
      element: <AuthPage />,
    },
    {
      path: "forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "reset-password",
      element: <ResetPasswordPage />,
    },
    {
      path: "verify-email",
      element: <OTPPage />,
    },
    {
      path: "setup-account",
      element: <SetupAccountPage />,
    },
  ],
};