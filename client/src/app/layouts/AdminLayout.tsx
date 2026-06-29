import { Outlet, Navigate } from "react-router-dom"
import Sidebar from "../../shared/components/layouts/Sidebar"
import Header from "../../shared/components/layouts/Header"
import { adminSideBarItems } from "../../shared/config/sidebar.config"
import { useAuthStore } from "../../features/auth/store/authStore"
import { ROLE } from "../../shared/constants/role.const"
import Loading from "../../shared/components/ui/Loading"

const AdminLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Loading fullScreen text="Loading Administrator Dashboard..." />
    );
  }

  if (!isAuthenticated || !user || user.role !== ROLE.ADMIN) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header role={ROLE.ADMIN} />
      <div className="flex flex-1 pt-20 px-6">
        <Sidebar items={adminSideBarItems} />
        <main className="flex-1 md:pl-24 pl-0 pb-24 md:pb-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout