import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
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
      "inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-panel disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg";

    const variants = {
      primary: "bg-accent text-on-accent hover:opacity-90 active:opacity-80",
      secondary: "bg-transparent text-text border border-border-input hover:bg-surface-hover",
      outline: "bg-transparent text-text border border-border-input hover:bg-surface-hover",
      ghost: "bg-transparent text-text-muted hover:text-text hover:bg-surface-hover",
      danger: "bg-transparent text-danger border border-danger/40 hover:bg-danger/10",
    };

    const sizes = {
      sm: "h-8 px-3 text-[13px] gap-1.5",
      md: "h-8 px-3 text-[13px] gap-1.5",
      lg: "h-9 px-4 text-[13px] gap-2",
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