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

  let colorBar = "bg-ok";
  let colorText = "text-text-muted";

  if (isOver) {
    colorBar = "bg-danger";
    colorText = "text-danger font-semibold";
  } else if (isNear) {
    colorBar = "bg-warn";
    colorText = "text-warn font-semibold";
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium text-text-muted">{label}</span>
        <div className="flex items-center gap-1.5 tabular-nums">
          <span className={cn("font-medium transition-colors duration-150", colorText)}>
            {formatNumber(current)} / {formatNumber(max)} {unit}
          </span>
          <span className="text-text-faint">
            ({formatNumber(percentage, 0)}%)
          </span>
        </div>
      </div>
      <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden relative border border-border/40">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorBar,
            isNear && "shadow-[0_0_8px_rgba(217,162,63,0.35)]",
            isOver && "shadow-[0_0_8px_rgba(236,106,94,0.45)]"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isOver && (
        <p className="text-[12px] text-danger font-medium animate-in fade-in duration-150 flex items-center gap-1">
          <span>⚠️</span> Excede la capacidad máxima por {formatNumber(current - max)} {unit}
        </p>
      )}
    </div>
  );
}
