import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { Menu, Search } from "lucide-react";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchGuide, setSearchGuide] = useState("");

  const getBreadcrumb = (path: string) => {
    if (path === "/" || path === "") return "Inicio / Dashboard";
    if (path.startsWith("/rastreo")) return "Inicio / Rastreo de Guía";
    if (path.startsWith("/guias")) return "Inicio / Emisión de Guías";
    if (path.startsWith("/despacho")) return "Inicio / Asignación de Carga";
    if (path.startsWith("/manifiesto")) return "Inicio / Manifiesto de Carga";
    if (path.startsWith("/liquidacion")) return "Inicio / Liquidación Financiera";
    if (path.startsWith("/catalogos/sucursales")) return "Inicio / Sucursales";
    if (path.startsWith("/catalogos/clientes")) return "Inicio / Clientes";
    if (path.startsWith("/catalogos/rutas")) return "Inicio / Rutas";
    if (path.startsWith("/catalogos/vehiculos")) return "Inicio / Vehículos";
    if (path.startsWith("/catalogos/pilotos")) return "Inicio / Pilotos";
    if (path.startsWith("/catalogos/tarifas")) return "Inicio / Tarifas";
    if (path.startsWith("/catalogos/usuarios")) return "Inicio / Usuarios";
    return "Inicio";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchGuide.trim();
    if (clean) {
      navigate(`/rastreo?no=${clean}`);
      setSearchGuide("");
    }
  };

  const initials = user?.nombre
    ? user.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || "US";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-12 px-4 sm:px-6 bg-[#090d16] border-b border-slate-800">
      {/* Left: Mobile hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1 text-slate-400 hover:text-white rounded lg:hidden hover:bg-slate-800 cursor-pointer"
          title="Menú"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-xs text-slate-400 font-medium select-none truncate">
          {getBreadcrumb(location.pathname)}
        </span>
      </div>

      {/* Right: Quick search input and User info */}
      <div className="flex items-center gap-4">
        {/* Search guide input */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-56 lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="number"
            value={searchGuide}
            onChange={(e) => setSearchGuide(e.target.value)}
            placeholder="Buscar guía por número"
            className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 text-xs rounded-md border border-slate-700/80 pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono tracking-tight"
          />
        </form>

        {/* User initials & role */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-mono text-xs font-semibold select-none"
            title={`${user?.nombre || user?.username} (${user?.rol})`}
          >
            {initials}
          </div>
          <span className="hidden md:inline text-xs text-slate-300 font-medium">
            {user?.rol || "Usuario"}
          </span>
        </div>
      </div>
    </header>
  );
}
