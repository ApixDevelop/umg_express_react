import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-panel border border-border bg-surface p-4 space-y-1.5 transition-all duration-150 ease-out hover:border-border-input hover:shadow-[0_2px_12px_rgba(0,0,0,0.25)] group">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-normal text-text-muted group-hover:text-text transition-colors">
          {title}
        </div>
        {icon && <div className="text-text-muted/60 group-hover:text-accent transition-colors">{icon}</div>}
      </div>
      <div className="text-[24px] font-semibold text-text tabular-nums leading-none tracking-tight">
        {value}
      </div>
      {subtitle && <div className="text-[12px] text-text-faint">{subtitle}</div>}
    </div>
  );
}
