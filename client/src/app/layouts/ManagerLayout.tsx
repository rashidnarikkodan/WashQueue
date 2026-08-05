import { Suspense } from "react"
import { Outlet, Navigate } from "react-router-dom"
import Header from "../../shared/components/layouts/Header"
import { ROLE } from "../../shared/constants/role.const"
import { useAuthStore } from "../../features/auth/store/auth.store"
import Loading from "../../shared/components/ui/Loading"
import { managerSideBarItems } from "@/shared/config/sidebar.config"
import Sidebar from "@/shared/components/layouts/Sidebar"

const ManagerLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) {
    return <Loading fullScreen text="Loading Manager Dashboard..." />
  }

  if (!isAuthenticated || !user || user.role !== ROLE.MANAGER) {
    return <Navigate to="/login" replace />
  }

  if (user && !user.isVerified && user.authProvider === "local") {
    return <Navigate to="/verify-email" replace />
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header role={ROLE.MANAGER} />
      <Sidebar items={managerSideBarItems} />
      <main className="flex-1 p-6">
        <Suspense fallback={<Loading text="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

export default ManagerLayout
