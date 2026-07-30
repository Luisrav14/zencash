import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, id, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "h-12 w-full rounded-xl border border-border bg-surface-muted px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary",
          error && "border-expense focus:border-expense",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-expense">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
