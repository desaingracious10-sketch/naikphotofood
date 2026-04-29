import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isActive, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="loader h-10 w-10 border-4 border-slate-700 rounded-full mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Memuat sesi admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isActive) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.is_admin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ error: 'Akses ditolak. Akun ini bukan admin.' }}
      />
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
