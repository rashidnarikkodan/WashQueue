import { Outlet, Navigate } from "react-router-dom"
import PrivateHeader from "../../shared/components/layouts/PrivateHeader"
import { useAuthStore } from "../../features/auth/store/authStore"

const ProviderLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "provider") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PrivateHeader />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default ProviderLayout