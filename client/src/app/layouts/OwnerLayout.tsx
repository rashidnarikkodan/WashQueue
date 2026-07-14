import { useEffect } from "react"
import { useLocation, Link, Outlet, Navigate } from "react-router-dom"
import Sidebar from "../../shared/components/layouts/Sidebar"
import Header from "../../shared/components/layouts/Header"
import { ownerSideBarItems } from "../../shared/config/sidebar.config"
import { ROLE, VIEW_MODE } from "../../shared/constants/role.const"
import { useAuthStore } from "../../features/auth/store/authStore"
import Loading from "../../shared/components/ui/Loading"

const OwnerLayout = () => {
  const { isAuthenticated, user, isLoading, activeViewMode, setActiveViewMode } = useAuthStore();

  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated && user?.role === ROLE.OWNER && activeViewMode !== VIEW_MODE.OWNER) {
      setActiveViewMode(VIEW_MODE.OWNER);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <Loading fullScreen text="Loading Owner Dashboard..." />
    );
  }

  if (!isAuthenticated || !user || (user.role !== ROLE.OWNER && location.pathname !== '/owner/onboarding')) {
    return <Navigate to="/login" replace />;
  }


  // Redirect owner users to onboarding if they haven't completed it yet
  if (user && user.role === ROLE.OWNER && (!user.onboardingStep || user.onboardingStep < 4) && location.pathname !== '/owner/onboarding') {
    return <Navigate to="/owner/onboarding" replace />;
  }

  const isOnboarding = location.pathname === '/owner/onboarding';

  if (isOnboarding) {
    return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className='absolute z-100 left-0 right-0 top-0 flex items-center justify-between p-3 pl-6'>
        <Link to="/" className="flex items-center gap-2 group">
          <span className={`text-xl font-bold italic tracking-tight transition-colors duration-300 text-primary`}>
            WashQueue
          </span>
        </Link>
      </header>
      <main className="flex-1 w-full flex items-center justify-center">
        <Outlet />
      </main>
    </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header role={ROLE.OWNER} />
      <div className="flex flex-1 pt-20 px-6">
        <Sidebar items={ownerSideBarItems} />
        <main className="flex-1 md:pl-24 pl-0 pb-24 md:pb-6 overflow-y-auto">

          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default OwnerLayout
