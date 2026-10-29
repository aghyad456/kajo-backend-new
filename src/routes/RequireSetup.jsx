import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireSetup() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = Number(user?.role);
  const isAdmin = role === 1;
  const isClinic = role === 5;
  const isStore = role === 3;

  const hasSetup = !!(user?.hasSetup ?? user?.has_setup);
  const inSetup = location.pathname.startsWith("/app/setup");

  // الأدمن لا يحتاج setup
  if (isAdmin) {
    return <Outlet />;
  }

  // الأدوار التي تحتاج setup
  const needsSetup = isClinic || isStore;

  // إذا هذا الدور لا يحتاج setup
  if (!needsSetup) {
    return <Outlet />;
  }

  // إذا لم يُكمل setup
  if (!hasSetup) {
    // اسمح له فقط بصفحة setup
    if (inSetup) {
      return <Outlet />;
    }

    return <Navigate to="/app/setup" replace state={{ from: location }} />;
  }

  // إذا أكمل setup وما زال داخل /app/setup
  if (hasSetup && inSetup) {
    if (isClinic) {
      return <Navigate to="/app/dashboard" replace />;
    }

    if (isStore) {
      return <Navigate to="/app/store-dashboard" replace />;
    }
  }

  return <Outlet />;
}