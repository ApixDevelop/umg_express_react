import React from "react";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.rol)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Su rol actual (<span className="text-amber-400 font-semibold">{user?.rol || "Sin rol"}</span>) no cuenta con los permisos necesarios para acceder a este módulo.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-900 bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors"
        >
          Regresar al Panel Principal
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
