/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
const AuthLayout = lazy(() => import("../layouts/AuthLayout"))
const AuthPage = lazy(() => import("../../features/auth/pages/AuthPage"))
const ForgotPasswordPage = lazy(() => import("../../features/auth/pages/ForgotPasswordPage"))
const ResetPasswordPage = lazy(() => import("../../features/auth/pages/ResetPasswordPage"))
const OTPPage = lazy(() => import("../../features/auth/pages/OTPPage"))
const SetupAccountPage = lazy(() => import("../../features/auth/pages/SetupAccountPage"))
const AcceptInvitationPage = lazy(() => import("../../features/auth/pages/AcceptInvitationPage"))
import { APP_ROUTES } from "../../shared/constants/appRoutes.const"

export const authRoutes = {
  path: APP_ROUTES.HOME,
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
    {
      path: "accept-invitation",
      element: <AcceptInvitationPage />,
    },
  ],
}
