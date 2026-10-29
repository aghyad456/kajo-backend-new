import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // انتظر تحقق التوكن
  if (loading) return null;

  // ليس مسجل دخول
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ليس أدمن
  if (Number(user.role) !== 1) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
