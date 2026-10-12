import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorAccent?: "amber" | "indigo" | "emerald" | "rose" | "blue";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorAccent = "amber",
}: StatCardProps) {
  const accents = {
    amber: "border-amber-500/20 text-amber-500 bg-amber-500/10",
    indigo: "border-indigo-500/20 text-indigo-400 bg-indigo-500/10",
    emerald: "border-emerald-500/20 text-emerald-400 bg-emerald-500/10",
    rose: "border-rose-500/20 text-rose-400 bg-rose-500/10",
    blue: "border-blue-500/20 text-blue-400 bg-blue-500/10",
  }[colorAccent];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl transition-all duration-200 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={cn("p-2.5 rounded-xl border flex items-center justify-center", accents)}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
          {value}
        </h4>
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-semibold font-mono px-1.5 py-0.5 rounded",
                  trend.isPositive ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                )}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
