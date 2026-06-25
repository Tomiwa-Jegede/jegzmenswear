import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

function ProtectedAdminRoute() {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedAdminRoute;
