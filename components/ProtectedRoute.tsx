import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, statusMessage } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isActive, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="loader h-10 w-10 border-4 border-slate-200 rounded-full mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isActive) {
    const msg = profile ? statusMessage(profile.status) : 'Akun belum aktif.';
    return <Navigate to="/login" replace state={{ error: msg }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
