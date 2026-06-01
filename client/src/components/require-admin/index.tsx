import { useContext } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { ProgressSpinner } from "primereact/progressspinner";

export function RequireAdmin() {
  const { authenticated, authenticatedUser, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  const isAdmin = authenticatedUser?.authorities?.some(
    (auth) => auth.authority === "ROLE_ADMIN"
  );

  return authenticated && isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
}
