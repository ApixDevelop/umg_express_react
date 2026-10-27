import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { getBackendInfo } from "@/api/client";
import {
  Package,
  Network,
  GitFork,
  LayoutDashboard,
  Search,
  Truck,
  FileText,
  DollarSign,
  Building2,
  Users,
  MapPin,
  UserCheck,
  Tag,
  UserPlus,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: string[];
}

interface NavGroup {
  title: string;
  roles?: string[];
  items: NavItem[];
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isServerUp, setIsServerUp] = useState<boolean | null>(null);
  const backendInfo = getBackendInfo();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await authApi.getHealth();
        if (mounted) setIsServerUp(res.status === "UP");
      } catch {
        if (mounted) setIsServerUp(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      logout();
      navigate("/login");
    }
  };

  const role = user?.rol || "Operador";

  const navGroups: NavGroup[] = [
    {
      title: "General",
      items: [
        { label: "Dashboard", to: "/", icon: LayoutDashboard },
        { label: "Rastreo de guía", to: "/rastreo", icon: Search },
      ],
    },
    {
      title: "Operaciones",
      items: [
        { label: "Emisión de guías", to: "/guias", icon: Package, roles: ["Administrador", "Operador"] },
        { label: "Asignación de carga", to: "/despacho", icon: Truck, roles: ["Administrador", "Operador"] },
      ],
    },
    {
      title: "Consultas y reportes",
      items: [
        { label: "Manifiesto de carga", to: "/manifiesto", icon: FileText, roles: ["Administrador", "Operador", "Auditor"] },
        { label: "Liquidación financiera", to: "/liquidacion", icon: DollarSign, roles: ["Administrador", "Auditor"] },
        { label: "Árbol BST de Guías", to: "/arbol-guias", icon: Network, roles: ["Administrador", "Operador", "Auditor"] },
        { label: "Red de Rutas (Grafos)", to: "/red-rutas", icon: GitFork, roles: ["Administrador", "Operador", "Auditor"] },
      ],
    },
    {
      title: "Mantenimientos",
      roles: ["Administrador", "Operador"],
      items: [
        { label: "Sucursales", to: "/catalogos/sucursales", icon: Building2, roles: ["Administrador"] },
        { label: "Clientes", to: "/catalogos/clientes", icon: Users, roles: ["Administrador", "Operador"] },
        { label: "Rutas", to: "/catalogos/rutas", icon: MapPin, roles: ["Administrador"] },
        { label: "Vehículos", to: "/catalogos/vehiculos", icon: Truck, roles: ["Administrador"] },
        { label: "Pilotos", to: "/catalogos/pilotos", icon: UserCheck, roles: ["Administrador"] },
        { label: "Tarifas", to: "/catalogos/tarifas", icon: Tag, roles: ["Administrador"] },
        { label: "Usuarios", to: "/catalogos/usuarios", icon: UserPlus, roles: ["Administrador"] },
      ],
    },
  ];

  const initials = user?.nombre
    ? user.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || "US";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[232px] bg-bg border-r border-border transition-transform duration-150 lg:translate-x-0 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-4 h-12 border-b border-border shrink-0">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-on-accent font-bold shrink-0">
            <Package className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-text leading-none">
              UMG <span className="text-accent">Express</span>
            </div>
            <p className="text-[11px] text-text-muted leading-tight mt-0.5">
              Control logístico
            </p>
          </div>
        </div>

        {/* Navigation items grouped */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map((group) => {
            if (group.roles && !group.roles.includes(role)) return null;

            const visibleItems = group.items.filter(
              (item) => !item.roles || item.roles.includes(role)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-0.5">
                <div className="px-2.5 pb-1 text-[12px] font-normal text-text-muted">
                  {group.title}
                </div>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 px-2.5 h-[34px] rounded-panel text-[13px] font-normal transition-colors",
                        isActive
                          ? "border-l-2 border-accent bg-surface-hover text-text font-medium"
                          : "text-text-muted hover:bg-surface-hover hover:text-text border-l-2 border-transparent"
                      )
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0 text-current" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-bg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[11px] font-medium text-text">
                  {initials}
                </div>
                {/* Discrete backend dot with tooltip */}
                <span
                  title={
                    isServerUp === true
                      ? `Servidor conectado (${backendInfo.label})`
                      : isServerUp === false
                      ? `Sin conexión con backend (${backendInfo.label})`
                      : `Verificando conexión (${backendInfo.label})`
                  }
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-bg",
                    isServerUp === true
                      ? "bg-ok"
                      : isServerUp === false
                      ? "bg-danger"
                      : "bg-warn"
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text truncate">
                  {user?.nombre || user?.username || "Usuario"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted truncate">
                  <span>{role}</span>
                  <span className="text-text-faint">·</span>
                  <span className="text-[10px] font-mono text-accent/90">{backendInfo.shortLabel}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}