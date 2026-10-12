import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

    const variants = {
      primary:
        "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold focus:ring-amber-500 shadow-sm",
      secondary:
        "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500 shadow-sm",
      outline:
        "bg-transparent hover:bg-slate-800/80 text-slate-200 border border-slate-750 focus:ring-amber-500",
      ghost:
        "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-500",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-sm",
      success:
        "bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-2.5 text-xs gap-1.5",
      md: "h-9 px-3.5 text-xs sm:text-sm gap-2",
      lg: "h-10 px-4 text-sm gap-2",
      icon: "h-8 w-8 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
