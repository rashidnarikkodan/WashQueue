import { useEffect } from "react"
import { Outlet, Navigate, useLocation, Link, useNavigate } from "react-router-dom"
import { ArrowLeftRight, Hourglass } from "lucide-react"
import Sidebar from "../../shared/components/layouts/Sidebar"
import Header from "../../shared/components/layouts/Header"
import { ownerSideBarItems } from "../../shared/config/sidebar.config"
import { ROLE } from "../../shared/constants/role.const"
import { useAuthStore } from "../../features/auth/store/authStore"
import Loading from "../../shared/components/ui/Loading"

const OwnerLayout = () => {
  const { isAuthenticated, user, isLoading, activeViewMode, setActiveViewMode } = useAuthStore();

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user?.role === ROLE.OWNER && activeViewMode !== "owner") {
      setActiveViewMode("owner");
    }
  }, [location.pathname, isAuthenticated, user, activeViewMode, setActiveViewMode]);

  if (isLoading) {
    return (
      <Loading fullScreen text="Loading Owner Dashboard..." />
    );
  }

  if (!isAuthenticated || !user || (user.role !== ROLE.OWNER && location.pathname !== '/owner/onboarding')) {
    return <Navigate to="/login" replace />;
  }

  const handleSwitchToCustomer = () => {
    setActiveViewMode("customer");
    navigate("/");
  };

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
          {user && user.role === ROLE.OWNER && !user.isVerified && (
            <div className="mb-6 border border-amber-500/15 bg-amber-500/5 rounded-2xl p-4 flex items-center justify-between text-left animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Hourglass size={16} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Verification Pending</h4>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Our administrators are reviewing your documents. Your operational capabilities will be unlocked once approved.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSwitchToCustomer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <ArrowLeftRight size={10} />
                <span>Switch to Customer</span>
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default OwnerLayout