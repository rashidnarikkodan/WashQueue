import { Outlet, Navigate } from "react-router-dom"
import Header from "../../shared/components/layouts/Header"
import { useAuthStore } from "../../features/auth/store/authStore"

const ManagerLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "manager") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default ManagerLayout