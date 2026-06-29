import { Outlet, Navigate, useLocation } from "react-router-dom"
import Sidebar from "../../shared/components/layouts/Sidebar"
import Header from "../../shared/components/layouts/Header"
import { providerSideBarItems } from "../../shared/config/sidebar.config"
import { ROLE } from "../../shared/constants/role.const"
import { useAuthStore } from "../../features/auth/store/authStore"
import Loading from "../../shared/components/ui/Loading"

const ProviderLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  const location = useLocation()

  if (isLoading) {
    return (
      <Loading fullScreen text="Loading Provider Dashboard..." />
    );
  }

  if (!isAuthenticated || !user || user.role !== ROLE.PROVIDER && location.pathname !== '/provider/onboarding') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header role={ROLE.PROVIDER} />
      <div className="flex flex-1 pt-20 px-6">
        <Sidebar items={providerSideBarItems} />
        <main className="flex-1 md:pl-24 pl-0 pb-24 md:pb-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ProviderLayout