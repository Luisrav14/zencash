import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, label, error, id, children, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          "h-12 w-full rounded-xl border border-border bg-surface-muted px-4 text-base text-foreground outline-none transition-colors focus:border-primary",
          error && "border-expense focus:border-expense",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-expense">{error}</span>}
    </div>
  );
});

Select.displayName = "Select";
