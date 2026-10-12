import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { Menu, Search } from "lucide-react";

interface TopbarProps {
  onOpenSidebar: () => void;
}

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/rastreo": "Rastreo de guía",
  "/guias": "Emisión de guías",
  "/despacho": "Asignación de carga",
  "/manifiesto": "Manifiesto de carga",
  "/liquidacion": "Liquidación financiera",
  "/catalogos/sucursales": "Sucursales",
  "/catalogos/clientes": "Clientes",
  "/catalogos/rutas": "Rutas",
  "/catalogos/vehiculos": "Vehículos",
  "/catalogos/pilotos": "Pilotos",
  "/catalogos/tarifas": "Tarifas",
  "/catalogos/usuarios": "Usuarios",
};

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState("");

  const currentTitle = routeTitles[location.pathname] || "Dashboard";

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    navigate(`/rastreo?no=${encodeURIComponent(quickSearch.trim())}`);
    setQuickSearch("");
  };

  const initials = user?.nombre
    ? user.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || "US";

  return (
    <header className="sticky top-0 h-12 bg-bg border-b border-border z-30 flex items-center justify-between px-4 sm:px-6 w-full shrink-0">
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="w-4 h-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted">Inicio</span>
          <span className="text-text-faint">/</span>
          <span className="text-text font-medium">{currentTitle}</span>
        </nav>
      </div>

      {/* Right: Quick search & User */}
      <div className="flex items-center gap-3">
        {/* Quick Guide Search */}
        <form onSubmit={handleQuickSearch} className="hidden sm:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Buscar guía por número"
              className="w-48 lg:w-56 h-8 bg-surface text-text placeholder-text-muted text-xs rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </form>

        {/* User preview */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-6 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[10px] font-medium text-text">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-text leading-tight truncate max-w-[120px]">
              {user?.nombre?.split(" ")[0] || user?.username || "Usuario"}
            </p>
            <p className="text-[10px] text-text-muted leading-tight">
              {user?.rol || "Operador"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}