import { useEffect, useMemo, Suspense } from "react"
import { useLocation, Link, Outlet, Navigate } from "react-router-dom"
import Sidebar from "../../shared/components/layouts/Sidebar"
import Header from "../../shared/components/layouts/Header"
import { ownerSideBarItems } from "../../shared/config/sidebar.config"
import { ROLE, VIEW_MODE } from "../../shared/constants/role.const"
import { useAuthStore } from "../../features/auth/store/auth.store"
import Loading from "../../shared/components/ui/Loading"
import Banner from "../../shared/components/ui/Banner"

const OwnerLayout = () => {
  const { isAuthenticated, user, isLoading, setActiveViewMode } = useAuthStore()

  const location = useLocation()
  const isOnboarding = location.pathname === "/owner/onboarding"

  const sidebarItems = useMemo(() => {
    return ownerSideBarItems.filter((item) => {
      if (item.path === "/owner/queues") {
        return Boolean(user?.isManager)
      }
      return true
    })
  }, [user?.isManager])

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.role === ROLE.OWNER &&
      user?.onboardingStep &&
      user.onboardingStep >= 4 &&
      !isOnboarding
    ) {
      setActiveViewMode(VIEW_MODE.OWNER)
    }
  }, [isAuthenticated, user?.role, user?.onboardingStep, isOnboarding, setActiveViewMode])

  if (isLoading) {
    return <Loading fullScreen text="Loading Owner Dashboard..." />
  }

  if (!isAuthenticated || !user || (user.role !== ROLE.OWNER && !isOnboarding)) {
    return <Navigate to="/login" replace />
  }

  if (user && !user.isVerified && user.authProvider === "local") {
    return <Navigate to="/verify-email" replace />
  }

  if (
    user &&
    user.role === ROLE.OWNER &&
    (!user.onboardingStep || user.onboardingStep < 4) &&
    !isOnboarding
  ) {
    return <Navigate to="/owner/onboarding" replace />
  }

  if (isOnboarding) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="absolute z-100 left-0 right-0 top-0 flex items-center justify-between p-3 pl-6">
          <Link
            to="/"
            onClick={() => setActiveViewMode(VIEW_MODE.CUSTOMER)}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span
              className={`text-xl font-bold italic tracking-tight transition-colors duration-300 text-primary`}
            >
              WashQueue
            </span>
          </Link>
        </header>
        <main className="flex-1 w-full flex items-center justify-center">
          <Suspense fallback={<Loading text="Loading setup..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header role={ROLE.OWNER} />
      <div className="flex flex-1 pt-20 px-6">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 md:pl-24 pl-0 pb-24 md:pb-6 overflow-y-auto">
          {user && !user.isVerified && (
            <Banner
              status="warn"
              title="Account Verification Pending Admin Approval"
              badgeText="Under Review"
              description="Your owner account and business documents have been submitted and are currently being reviewed by our administrative team. Station listings and payout operations will unlock once approved."
            />
          )}
          <Suspense fallback={<Loading text="Loading page..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default OwnerLayout
