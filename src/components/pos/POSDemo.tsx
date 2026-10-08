import { Link } from "@tanstack/react-router";
import { AlertTriangle, BarChart3, Maximize2, RotateCcw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionCard } from "./ActionCard";
import { BasketEditor, CustomerPicker, OriginalList } from "./CustomerBasket";
import { CommercialPanel } from "./CommercialPanel";
import { DemoTour } from "./DemoTour";
import { EventLog } from "./EventLog";
import { usePosDemo } from "./usePosDemo";

/**
 * POS simulado: cliente, canasta, listado original frente a la acción priorizada, eventos y
 * configuración de Comercial. Estado local; todo el acceso a datos pasa por `@/api`.
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
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 p-3 sm:p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black leading-tight">Mostrador · {data.store.name}</h2>
          <p className="text-xs text-muted-foreground">
            Campaña {data.campaign.id} · {data.store.id}
          </p>
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

      {!data.persistent && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este navegador no ofrece almacenamiento local: los datos viven en memoria y se pierden
            al recargar.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
          <CustomerPicker pos={pos} data={data} />
          <BasketEditor pos={pos} data={data} />
          <OriginalList pos={pos} data={data} />
        </div>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
          <ActionCard pos={pos} data={data} />
          <EventLog events={data.events} data={data} />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-2">
        <DemoTour pos={pos} />
        <CommercialPanel pos={pos} data={data} />
      </div>
    </div>
  );
}
