import { Outlet, Navigate } from "react-router-dom"
import Header from "../../shared/components/layouts/Header"
import { ROLE } from "../../shared/constants/role.const"
import { useAuthStore } from "../../features/auth/store/authStore"
import Loading from "../../shared/components/ui/Loading"

const ManagerLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Loading fullScreen text="Loading Manager Dashboard..." />
    );
  }

  if (!isAuthenticated || !user || user.role !== ROLE.MANAGER) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header role={ROLE.MANAGER} />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default ManagerLayout