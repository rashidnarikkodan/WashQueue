import { Outlet, Navigate } from "react-router-dom"
import Sidebar from "../../shared/components/layouts/Sidebar"
import PrivateHeader from "../../shared/components/layouts/PrivateHeader"
import { adminSideBarItems } from "../../shared/config/adminSidebar.config"
import { useAuthStore } from "../../features/auth/store/authStore"

const AdminLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={adminSideBarItems}/>
      <div className="flex flex-col flex-1 pl-28 min-h-screen">
        <PrivateHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout