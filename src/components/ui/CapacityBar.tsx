import React from "react";
import { cn, formatNumber } from "@/lib/utils";

export interface CapacityBarProps {
  label: string;
  current: number;
  max: number;
  unit: string;
  className?: string;
}

export function CapacityBar({ label, current, max, unit, className }: CapacityBarProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isOver = current > max;
  const isNear = percentage >= 85 && !isOver;

  let colorBar = "bg-emerald-500";
  let colorText = "text-emerald-400";
  let statusText = "Capacidad óptima";

  if (isOver) {
    colorBar = "bg-rose-500";
    colorText = "text-rose-400";
    statusText = "¡EXCEDIDO!";
  } else if (isNear) {
    colorBar = "bg-amber-500";
    colorText = "text-amber-400";
    statusText = "Casi lleno";
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">{label}</span>
        <div className="flex items-center gap-2 font-mono">
          <span className={cn("font-bold", colorText)}>
            {formatNumber(current)} / {formatNumber(max)} {unit}
          </span>
          <span className={cn("text-[10px] px-1.5 py-0.2 rounded font-semibold", colorText, isOver ? "bg-rose-500/15" : "bg-slate-800")}>
            {formatNumber(percentage, 1)}%
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
        <div
          className={cn("h-full rounded-full transition-all duration-300", colorBar)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isOver && (
        <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 animate-pulse">
          ⚠️ Excede la capacidad física máxima por {formatNumber(current - max)} {unit}
        </p>
      )}
    </div>
  );
}
