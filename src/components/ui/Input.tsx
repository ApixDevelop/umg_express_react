import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      type,
      step,
      onFocus,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);
    const [showPassword, setShowPassword] = useState(false);

    // Si es tipo número y no se especifica step, por defecto usa enteros (step="1")
    const resolvedStep = type === "number" ? (step || "1") : step;

    // Si es password, permite alternar la visibilidad
    const isPassword = type === "password";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-text truncate whitespace-nowrap">
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
            type={actualType}
            step={resolvedStep}
            onFocus={(e) => {
              // Auto-selecciona el texto en campos numéricos al enfocar para que no se anteponga el 0
              if (type === "number") {
                e.target.select();
              }
              onFocus?.(e);
            }}
            className={cn(
              "w-full h-[34px] bg-surface text-text placeholder:text-text-faint text-[13px] rounded-control border border-border-input px-3",
              "transition-all duration-150 ease-out",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 focus:bg-surface-hover/30",
              leftIcon && "pl-8",
              (rightIcon || isPassword) && "pr-10",
              props.disabled && "opacity-60 cursor-not-allowed bg-surface-hover/30",
              error && "border-danger focus:border-danger focus:ring-danger/40",
              className
            )}
            {...props}
          />

          {/* Botón para alternar visibilidad de contraseña */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              className="absolute right-2.5 text-text-muted hover:text-text p-1 rounded transition-colors cursor-pointer focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-accent" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-2.5 text-text-muted flex items-center">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {error && <p className="text-[12px] text-danger animate-in fade-in duration-150">{error}</p>}
        {helperText && !error && <p className="text-[12px] text-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
