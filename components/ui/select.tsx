"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
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

        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 pl-4 pr-10 bg-surface border border-border rounded-xl",
              "font-body text-sm text-text-primary appearance-none cursor-pointer",
              "transition-all duration-150 outline-none",
              "focus:border-primary-500/60 focus:bg-card focus:ring-2 focus:ring-primary-500/20",
              error && "border-danger/60",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
        </div>

        {error && (
          <p className="text-xs text-danger font-body flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-danger flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
