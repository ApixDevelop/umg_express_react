import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/store/authStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
