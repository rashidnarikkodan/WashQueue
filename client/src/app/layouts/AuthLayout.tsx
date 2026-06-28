import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import Loading from '../../shared/components/ui/Loading';
import { ROLE } from '../../shared/constants/role.const';

export default function AuthLayout() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (isAuthenticated && user && !["/verify-email", "/setup-account"].includes(location.pathname)) {
    if (user.role === ROLE.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    if (user.role === ROLE.MANAGER) return <Navigate to="/manager/dashboard" replace />;
    if (user.role === ROLE.PROVIDER) return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  const getLogoColor = () => {
    if (location.pathname === "/login") {
      return "text-white";
    }
    if (location.pathname === "/signup") {
      return "text-white md:text-primary";
    }
    return "text-primary";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className='absolute z-100 left-0 right-0 top-0 flex items-center justify-between p-6'>
        <Link to="/" className="flex items-center gap-2 group">
          <span className={`text-xl font-bold italic tracking-tight transition-colors duration-300 ${getLogoColor()}`}>
            WashQueue
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}
