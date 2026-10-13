import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

// Only logged-in users can see these pages
export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Only administrators
export function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Login / register pages - skip them if already logged in
export function GuestRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
