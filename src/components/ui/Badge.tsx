import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-medium tracking-wide",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wide",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border uppercase transition-colors font-mono",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const norm = status?.toLowerCase() || "";

  if (norm.includes("creada") || norm.includes("bodega")) {
    return <Badge variant="info">En Bodega</Badge>;
  }
  if (norm.includes("despachada") || norm.includes("ruta")) {
    return <Badge variant="warning">En Ruta</Badge>;
  }
  if (norm.includes("entregada") || norm.includes("disponible")) {
    return <Badge variant="success">Disponible</Badge>;
  }
  if (norm.includes("taller")) {
    return <Badge variant="danger">En Taller</Badge>;
  }
  return <Badge variant="neutral">{status}</Badge>;
}
