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
      "inline-flex items-center justify-center font-medium select-none cursor-pointer rounded-panel " +
      "transition-all duration-150 ease-out active:scale-[0.98] active:duration-75 " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg " +
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none";

    const variants = {
      primary: "bg-accent text-on-accent hover:brightness-105 active:brightness-95 shadow-sm shadow-accent/10",
      secondary: "bg-surface text-text border border-border-input hover:bg-surface-hover hover:border-border-input/80 active:bg-surface",
      outline: "bg-transparent text-text border border-border-input hover:bg-surface-hover hover:border-border-input/80",
      ghost: "bg-transparent text-text-muted hover:text-text hover:bg-surface-hover active:bg-surface",
      danger: "bg-transparent text-danger border border-danger/40 hover:bg-danger/10 hover:border-danger/60 active:bg-danger/15",
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
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
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
