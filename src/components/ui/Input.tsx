import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-text">
            {label}
            {props.required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-2.5 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-[34px] bg-surface text-text placeholder-text-muted text-[13px] rounded-control border border-border-input px-3 transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg",
              leftIcon && "pl-8",
              rightIcon && "pr-8",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-2.5 text-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[12px] text-danger">{error}</p>}
        {helperText && !error && <p className="text-[12px] text-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";