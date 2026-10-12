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
  ChevronRight,
  Shield,
  Activity,
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

  // Health check ping
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

  // Menu groups based on RBAC
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
      title: "Consultas & Reportes",
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
        { label: "Tarifas de Carga", to: "/catalogos/tarifas", icon: Tag, roles: ["Administrador"] },
        { label: "Usuarios del Sistema", to: "/catalogos/usuarios", icon: UserPlus, roles: ["Administrador"] },
      ],
    },
  ];

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
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#0b1120] border-r border-slate-800/80 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800/80 bg-slate-950/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-heading">
                UMG <span className="text-amber-500">Express</span>
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
              Control Logístico
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => !item.roles || item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1.5">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => onClose()}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group select-none",
                            isActive
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-850/80 hover:border-slate-800"
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer profile & status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          {/* Server status pill */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Backend API</span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isServerUp === true && "bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse",
                  isServerUp === false && "bg-rose-500 shadow-sm shadow-rose-500/50",
                  isServerUp === null && "bg-slate-500"
                )}
              />
              <span className={cn(
                "text-[10px] font-semibold",
                isServerUp === true ? "text-emerald-400" : isServerUp === false ? "text-rose-400" : "text-slate-400"
              )}>
                {isServerUp === true ? "En línea :18080" : isServerUp === false ? "Desconectado" : "Verificando..."}
              </span>
            </div>
          </div>

          {/* User profile card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                {user?.username?.substring(0, 2) || "US"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-100 truncate">{user?.nombre || user?.username}</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-400/90 font-mono">
                  <Shield className="w-3 h-3" />
                  <span>{user?.rol}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
