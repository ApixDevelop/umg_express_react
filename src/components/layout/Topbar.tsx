import React from "react";
import { useAuthStore } from "@/store/authStore";
import { Menu, ShieldCheck } from "lucide-react";

interface TopbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export function Topbar({ onToggleSidebar, title }: TopbarProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-slate-800 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Rol activo: <strong className="text-amber-400 font-semibold">{user?.rol}</strong></span>
        </div>
      </div>
    </header>
  );
}
