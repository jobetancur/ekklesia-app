import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Route wrapper that checks if the authenticated user has one of the allowed roles.
 * @param {Object} props
 * @param {string[]} props.allowedRoles - List of roles allowed to access this route
 */
export default function RoleProtected({ allowedRoles = [] }) {
  const { profile, loading } = useAuth();

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  if (!profile) {
    // If not authenticated (or profile not loaded yet), let ProtectedRoute handle it or redirect
    return <Navigate to="/login" replace />;
  }

  const userRole = profile.role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // User role is not authorized. Redirect to a safe default.
    // Ideally this could be a "Unauthorized" page, but for now Dashboard Home is safe.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
