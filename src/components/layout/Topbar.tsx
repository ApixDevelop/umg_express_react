import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Menu, Search, Sun, Moon, Monitor, Command } from "lucide-react";

interface TopbarProps {
  onOpenSidebar: () => void;
}

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard Ejecutivo",
  "/rastreo": "Rastreo de Guía",
  "/guias": "Emisión de Guías",
  "/despacho": "Asignación y Despacho",
  "/manifiesto": "Manifiesto de Carga",
  "/liquidacion": "Liquidación Financiera",
  "/catalogos/sucursales": "Mantenimiento de Sucursales",
  "/catalogos/clientes": "Mantenimiento de Clientes",
  "/catalogos/rutas": "Mantenimiento de Rutas",
  "/catalogos/vehiculos": "Mantenimiento de Vehículos",
  "/catalogos/pilotos": "Mantenimiento de Pilotos",
  "/catalogos/tarifas": "Mantenimiento de Tarifas",
  "/catalogos/usuarios": "Mantenimiento de Usuarios",
};

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user } = useAuthStore();
  const { theme, resolvedTheme, toggleTheme } = useThemeStore();
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
    <header className="sticky top-0 h-12 bg-bg/95 backdrop-blur-[4px] border-b border-border z-30 flex items-center justify-between px-4 sm:px-6 w-full shrink-0 transition-colors duration-200">
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover lg:hidden cursor-pointer active:scale-[0.97] transition-all"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-4 h-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted">Inicio</span>
          <span className="text-text-faint">/</span>
          <span className="text-text font-medium tracking-tight">{currentTitle}</span>
        </nav>
      </div>

      {/* Right: Quick search, Theme toggle & User */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Guide Search */}
        <form onSubmit={handleQuickSearch} className="hidden sm:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Buscar guía por número..."
              className="w-48 lg:w-56 h-8 bg-surface text-text placeholder:text-text-faint text-xs rounded-control border border-border-input pl-8 pr-7 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-all tabular-nums"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-text-faint flex items-center">
              ↵
            </div>
          </div>
        </form>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Tema actual: ${theme === "system" ? "Automático (Sistema)" : theme === "dark" ? "Oscuro" : "Claro"}. Clic para cambiar.`}
          className="h-8 px-2 rounded-control border border-border-input bg-surface text-text hover:bg-surface-hover flex items-center gap-1.5 text-xs cursor-pointer active:scale-[0.97] transition-all duration-150"
        >
          {theme === "system" ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="hidden md:inline text-[11px] text-text-muted">Auto</span>
            </>
          ) : resolvedTheme === "dark" ? (
            <>
              <Moon className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="hidden md:inline text-[11px] text-text-muted">Oscuro</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="hidden md:inline text-[11px] text-text-muted">Claro</span>
            </>
          )}
        </button>

        {/* User preview */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[10px] font-semibold text-text">
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
