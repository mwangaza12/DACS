"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary: [
    "bg-primary-500 text-white",
    "hover:bg-primary-600 active:bg-primary-700",
    "shadow-glow-sm hover:shadow-glow-md",
    "border border-primary-400/30",
  ].join(" "),

  secondary: [
    "bg-surface text-text-primary",
    "hover:bg-card active:bg-border",
    "border border-border hover:border-primary-500/40",
  ].join(" "),

  ghost: [
    "bg-transparent text-text-secondary",
    "hover:bg-white/5 hover:text-text-primary",
    "border border-transparent",
  ].join(" "),

  outline: [
    "bg-transparent text-primary-400",
    "border border-primary-500/40 hover:border-primary-400",
    "hover:bg-primary-500/10",
  ].join(" "),

  danger: [
    "bg-red-900/30 text-danger border border-red-800/50",
    "hover:bg-red-900/50 hover:border-red-700/50",
  ].join(" "),
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-body font-medium",
          "rounded-xl transition-all duration-150 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "select-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={size === "sm" ? 12 : size === "lg" ? 18 : 15} />
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
