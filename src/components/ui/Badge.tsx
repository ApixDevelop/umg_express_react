import React from "react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const norm = status?.toLowerCase() || "";

  if (norm.includes("creada") || norm.includes("bodega")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-normal">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        En bodega
      </span>
    );
  }
  if (norm.includes("despachada") || norm.includes("ruta")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-normal">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        En ruta
      </span>
    );
  }
  if (norm.includes("entregada") || norm.includes("disponible")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-normal">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {norm.includes("entregada") ? "Entregada" : "Disponible"}
      </span>
    );
  }
  if (norm.includes("taller")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-normal">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        En taller
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-normal">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      {status}
    </span>
  );
}
