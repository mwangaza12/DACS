"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightElement, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary uppercase tracking-wider font-body"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-text-tertiary pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 bg-surface border rounded-xl font-body text-sm text-text-primary",
              "placeholder:text-text-muted",
              "transition-all duration-150 outline-none",
              "border-border focus:border-primary-500/60 focus:bg-card",
              "focus:ring-2 focus:ring-primary-500/20",
              leftIcon ? "pl-10" : "pl-4",
              rightElement ? "pr-12" : "pr-4",
              error && "border-danger/60 focus:border-danger/60 focus:ring-danger/20",
              className
            )}
            {...props}
          />

          {rightElement && (
            <span className="absolute right-3 text-text-tertiary">
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger font-body flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-danger flex-shrink-0" />
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-text-tertiary font-body">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
