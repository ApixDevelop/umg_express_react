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
  let colorText = "text-slate-300";

  if (isOver) {
    colorBar = "bg-rose-500";
    colorText = "text-rose-400";
  } else if (isNear) {
    colorBar = "bg-amber-500";
    colorText = "text-amber-400";
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">{label}</span>
        <div className="flex items-center gap-1.5 tabular-nums text-xs">
          <span className={colorText}>
            {formatNumber(current)} / {formatNumber(max)} {unit}
          </span>
          <span className="text-[11px] text-slate-500">
            ({formatNumber(percentage, 0)}%)
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-200", colorBar)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isOver && (
        <p className="text-[11px] text-rose-400">
          Excede la capacidad máxima por {formatNumber(current - max)} {unit}
        </p>
      )}
    </div>
  );
}
