import { Minus, Plus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Contenedor común de las secciones del POS. */
export function Panel({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 rounded-2xl p-4 shadow-soft", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-extrabold text-foreground">
          {Icon && (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Icon size={15} />
            </span>
          )}
          <span className="truncate">{title}</span>
        </h3>
        {action}
      </div>
      {children}
    </Card>
  );
}

/** Selector +/− de cantidad (adaptado del Stepper de la maqueta original, con tipografía legible). */
export function QuantityStepper({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`Menos ${label}`}
        disabled={disabled || value <= 0}
        onClick={() => onChange(value - 1)}
        className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <span
        className="w-6 text-center text-sm font-black tabular-nums"
        aria-live="polite"
        aria-label={`${label}: ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Más ${label}`}
        disabled={disabled || value >= 9}
        onClick={() => onChange(value + 1)}
        className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
