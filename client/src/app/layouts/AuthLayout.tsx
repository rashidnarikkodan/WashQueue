import { Link, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import Loading from '../../shared/components/ui/Loading';

export default function AuthLayout() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (isAuthenticated && user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "manager") return <Navigate to="/manager/dashboard" replace />;
    if (user.role === "provider") return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className='absolute z-100 left-0 right-0 top-0 flex items-center justify-between p-6'>
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold italic tracking-tight text-primary">
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
