import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();

  const token = localStorage.getItem("token");

  // No token → user is not authenticated
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Token exists → allow access
  return <Outlet />;
}