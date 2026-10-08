import { Link } from "@tanstack/react-router";
import { AlertTriangle, BarChart3, Maximize2, RotateCcw, Store } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CommercialPanel } from "./CommercialPanel";
import { CustomerStep } from "./CustomerStep";
import { DemoTour } from "./DemoTour";
import { EventLog } from "./EventLog";
import { Invoice } from "./Invoice";
import { ProductTable } from "./ProductTable";
import { PromoDialog } from "./PromoDialog";
import { usePosDemo } from "./usePosDemo";

const STEPS = ["Cliente", "Productos", "Cobro"] as const;

/**
 * POS simulado: ingreso de cédula, factura con productos y ventana emergente con la promoción
 * sugerida. Estado local; todo el acceso a datos pasa por `@/api`.
 */
export function POSDemo({ embedded = false }: { embedded?: boolean }) {
  const pos = usePosDemo();
  const { data } = pos;

  if (pos.loadError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{pos.loadError}</AlertDescription>
      </Alert>
    );
  }
  if (!data) {
    return (
      <div className="grid gap-3 p-4" role="status" aria-label="Cargando demo">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const stepIndex = pos.completed ? 2 : pos.customer ? 1 : 0;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 p-3 sm:p-4">
      <DemoTour pos={pos} data={data} />

      {!data.persistent && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este navegador no ofrece almacenamiento local: los datos viven en memoria y se pierden
            al recargar.
          </AlertDescription>
        </Alert>
      )}

      <section
        aria-label="Caja registradora"
        className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 rounded-2xl border bg-muted/40 p-3 sm:p-4"
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-primary-foreground">
              <Store size={17} />
            </span>
            <div>
              <h2 className="text-base font-black leading-tight">FarmaPOS · Caja 01</h2>
              <p className="text-xs text-muted-foreground">
                {data.store.name} · campaña {data.campaign.id}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-10" disabled={pos.busy} onClick={pos.reset}>
              <RotateCcw /> Reiniciar demo
            </Button>
            {embedded && (
              <Button variant="outline" className="h-10" asChild>
                <Link to="/demo">
                  <Maximize2 /> Pantalla completa
                </Link>
              </Button>
            )}
            <Button variant="outline" className="h-10" asChild>
              <Link to="/resultados">
                <BarChart3 /> Resultados
              </Link>
            </Button>
          </div>
        </header>

        <ol className="flex flex-wrap gap-2" aria-label="Pasos de la venta">
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={i === stepIndex ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                i === stepIndex
                  ? "bg-primary text-primary-foreground"
                  : i < stepIndex
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-muted-foreground",
              )}
            >
              <span className="tabular-nums">{i + 1}</span> {label}
            </li>
          ))}
        </ol>

        {pos.customer ? (
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <ProductTable pos={pos} data={data} />
            <Invoice pos={pos} data={data} />
          </div>
        ) : (
          <CustomerStep pos={pos} data={data} />
        )}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-2">
        <EventLog events={data.events} data={data} />
        <CommercialPanel pos={pos} data={data} />
      </div>

      <PromoDialog pos={pos} />
    </div>
  );
}
