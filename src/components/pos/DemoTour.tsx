import { Link } from "@tanstack/react-router";
import { Check, Route as RouteIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PosDemoState } from "./usePosDemo";
import { Panel } from "./Panel";

/** Recorrido de demo: los 5 pasos de la sección 4 de la especificación. */
export function DemoTour({ pos }: { pos: PosDemoState }) {
  const [done, setDone] = useState<number[]>([]);
  const mark = (i: number) => setDone((d) => (d.includes(i) ? d : [...d, i]));
  const current = [0, 1, 2, 3, 4].find((i) => !done.includes(i)) ?? -1;
  const canPresent =
    pos.card.status === "ready" &&
    pos.card.rec.decision === "offer" &&
    !pos.status.presented &&
    !pos.status.not_presented &&
    !pos.busy &&
    !pos.completed;

  const steps: { title: string; text: string; action: React.ReactNode }[] = [
    {
      title: "Rosa: lista original frente a la acción",
      text: "Compare el listado original con la acción A que prioriza el asistente (afinidad Wellness alta).",
      action: (
        <Button size="sm" onClick={() => (pos.setCustomerId("c-rosa"), mark(0))}>
          Seleccionar Rosa
        </Button>
      ),
    },
    {
      title: "Luis con la misma canasta",
      text: "La misma canasta, otra afinidad: la prioridad pasa a B (Prácticos).",
      action: (
        <Button size="sm" onClick={() => (pos.setCustomerId("c-luis"), mark(1))}>
          Seleccionar Luis
        </Button>
      ),
    },
    {
      title: "Agotar el stock de B",
      text: "Con Luis seleccionado, B se descarta con su motivo y aparece la alternativa (o no hay oferta).",
      action: (
        <Button
          size="sm"
          disabled={pos.busy}
          onClick={() => (pos.admin.setStock("sku-champu", 0), mark(2))}
        >
          Agotar stock de B
        </Button>
      ),
    },
    {
      title: "Presentar y confirmar compra",
      text: "Presente la acción y luego pulse «Confirmar compra»: se revalidan las condiciones y se vincula la compra.",
      action: (
        <Button size="sm" disabled={!canPresent} onClick={() => (pos.present(), mark(3))}>
          Presentar acción
        </Button>
      ),
    },
    {
      title: "Abrir resultados",
      text: "Revise eventos, denominadores y la propuesta de la siguiente prueba para Comercial.",
      action: (
        <Button size="sm" asChild onClick={() => mark(4)}>
          <Link to="/resultados">Ir a resultados</Link>
        </Button>
      ),
    },
  ];

  return (
    <Panel title="Recorrido de demo" icon={RouteIcon}>
      <ol className="grid gap-2">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              "grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-xl border p-3",
              i === current ? "border-primary bg-primary-soft" : "border-border",
            )}
            aria-current={i === current ? "step" : undefined}
          >
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-xs font-black",
                done.includes(i)
                  ? "bg-success text-primary-foreground"
                  : "bg-lime text-lime-foreground",
              )}
            >
              {done.includes(i) ? <Check size={14} /> : i + 1}
            </span>
            <div className="grid gap-1.5">
              <p className="text-sm font-extrabold">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.text}</p>
              <div>{s.action}</div>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
