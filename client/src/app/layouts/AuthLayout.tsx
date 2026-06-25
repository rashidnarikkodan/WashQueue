import { Link, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
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
          <span className="text-xl font-bold italic tracking-tight text-foreground">
            WashQueue
          </span>
        </Link>
        <nav>
          
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}
