import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import {
  Package,
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

  // Health check ping for discrete dot
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
        { label: "Rastreo de Guía", to: "/rastreo", icon: Search },
      ],
    },
    {
      title: "Operaciones",
      items: [
        { label: "Emisión de Guías", to: "/guias", icon: Package, roles: ["Administrador", "Operador"] },
        { label: "Asignación de Carga", to: "/despacho", icon: Truck, roles: ["Administrador", "Operador"] },
      ],
    },
    {
      title: "Consultas y reportes",
      items: [
        { label: "Manifiesto de Carga", to: "/manifiesto", icon: FileText, roles: ["Administrador", "Operador", "Auditor"] },
        { label: "Liquidación Financiera", to: "/liquidacion", icon: DollarSign, roles: ["Administrador", "Auditor"] },
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
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0b1120] border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
            <Package className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white leading-tight">
              UMG <span className="text-amber-500">Express</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Control logístico
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => !item.roles || item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-[11px] font-medium text-slate-400">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => onClose()}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                            isActive
                              ? "bg-slate-800 text-amber-400 font-semibold"
                              : "text-slate-300 hover:text-white hover:bg-slate-850"
                          )
                        }
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: User profile and discrete backend dot */}
        <div className="p-3 border-t border-slate-800 bg-[#090e1a] flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            {/* User initials with discrete backend status dot */}
            <div className="relative">
              <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-mono text-xs font-semibold">
                {initials}
              </div>
              <span
                title={
                  isServerUp === true
                    ? "Servidor backend API en línea (puerto 18080)"
                    : isServerUp === false
                    ? "Servidor backend API desconectado"
                    : "Comprobando conexión..."
                }
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900",
                  isServerUp === true && "bg-emerald-500",
                  isServerUp === false && "bg-rose-500",
                  isServerUp === null && "bg-slate-500"
                )}
              />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.nombre || user?.username}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.rol}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
