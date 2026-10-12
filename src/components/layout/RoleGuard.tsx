import React from "react";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.rol)) {
    return (
      <div className="rounded-panel border border-border bg-surface p-6 text-center max-w-md mx-auto my-12 space-y-3">
        <h2 className="text-[16px] font-semibold text-text">Acceso restringido</h2>
        <p className="text-[13px] text-text-muted">
          Su rol actual (<span className="text-text font-medium">{user?.rol || "Sin rol"}</span>) no cuenta con permisos para este módulo.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="secondary" size="sm">
              Regresar al dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}