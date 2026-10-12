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
}: StatCardProps) {
  return (
    <div className="rounded-panel border border-border bg-surface p-4 space-y-1">
      <div className="text-[12px] text-text-muted">{title}</div>
      <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
        {value}
      </div>
      {subtitle && <div className="text-[12px] text-text-faint">{subtitle}</div>}
    </div>
  );
}