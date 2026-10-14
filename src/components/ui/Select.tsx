import React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-[13px] font-medium text-text">
            {label}
            {props.required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-[34px] bg-surface text-text text-[13px] rounded-control border border-border-input px-3 transition-all duration-150 appearance-none cursor-pointer",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 focus:bg-surface-hover/30",
              error && "border-danger focus:border-danger",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-surface text-text">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-[12px] text-danger animate-in fade-in duration-150">{error}</p>}
        {helperText && !error && <p className="text-[12px] text-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
