import React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = (status || "").trim().toLowerCase();

  let dotColor = "bg-text-muted";
  let textColor = "text-text-muted";
  let label = status;
  let isLive = false;

  if (norm === "creada" || norm === "en bodega") {
    dotColor = "bg-text-muted";
    textColor = "text-text-muted";
    label = "En bodega";
  } else if (norm === "despachada" || norm === "en transito" || norm === "en tránsito" || norm === "en ruta") {
    dotColor = "bg-info";
    textColor = "text-info";
    label = "En tránsito";
    isLive = true;
  } else if (norm === "entregada" || norm === "disponible" || norm === "activo") {
    dotColor = "bg-ok";
    textColor = "text-ok";
    label = norm === "disponible" ? "Disponible" : norm === "activo" ? "Activo" : "Entregada";
    if (norm === "disponible") isLive = true;
  } else if (norm === "en taller" || norm === "cancelada" || norm === "incidencia" || norm === "baja") {
    dotColor = "bg-danger";
    textColor = "text-danger";
    label = norm === "en taller" ? "En taller" : norm === "baja" ? "Baja" : "Incidencia";
  } else if (norm === "pendiente") {
    dotColor = "bg-warn";
    textColor = "text-warn";
    label = "Pendiente";
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-normal", textColor, className)}>
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
        {isLive && (
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", dotColor)} />
        )}
        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", dotColor)} />
      </span>
      <span>{label}</span>
    </span>
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  const colorMap = {
    default: "text-text-muted",
    success: "text-ok",
    warning: "text-warn",
    danger: "text-danger",
    info: "text-info",
  };

  return (
    <span
      className={cn("inline-flex items-center text-[13px]", colorMap[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
