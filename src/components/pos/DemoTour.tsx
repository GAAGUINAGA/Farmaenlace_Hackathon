import { Link } from "@tanstack/react-router";
import { Check, Route as RouteIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import type { DemoData } from "@/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PosDemoState } from "./usePosDemo";

const cedulaOf = (data: DemoData, id: string) =>
  data.customers.find((c) => c.id === id)?.cedula ?? "";

/** Recorrido de demo: contenedor horizontal al inicio del POS con los 5 pasos. */
export function DemoTour({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  const [done, setDone] = useState<number[]>([]);
  const mark = (i: number) => setDone((d) => (d.includes(i) ? d : [...d, i]));
  const current = [0, 1, 2, 3, 4].find((i) => !done.includes(i)) ?? -1;
  const bSkus = data.promotions.find((p) => p.id === "promo-B")?.items.map((i) => i.sku) ?? [];

  const steps: { title: string; text: string; action: ReactNode }[] = [
    {
      title: "Caso Rosa · Wellness",
      text: "Ingrese su cédula, agregue un producto Wellness y finalice la venta: se sugiere la promoción A.",
      action: (
        <Button
          size="sm"
          disabled={pos.busy}
          onClick={() => (void pos.startCase(cedulaOf(data, "c-rosa")), mark(0))}
        >
          Cargar a Rosa
        </Button>
      ),
    },
    {
      title: "Caso Luis · Prácticos",
      text: "Otra afinidad con el mismo objetivo: agregue un producto Prácticos y la prioridad pasa a la promoción B.",
      action: (
        <Button
          size="sm"
          disabled={pos.busy}
          onClick={() => (void pos.startCase(cedulaOf(data, "c-luis")), mark(1))}
        >
          Cargar a Luis
        </Button>
      ),
    },
    {
      title: "Caso Ana · Membresía",
      text: "Afinidad desconocida y membresía activa: con un producto de Membresía se sugiere la promoción C, exclusiva para socios.",
      action: (
        <Button
          size="sm"
          disabled={pos.busy}
          onClick={() => (void pos.startCase(cedulaOf(data, "c-ana")), mark(2))}
        >
          Cargar a Ana
        </Button>
      ),
    },
    {
      title: "Agotar el stock de B",
      text: "Comercial agota B y se repite el caso de Luis: B se descarta con su motivo y aparece la alternativa.",
      action: (
        <Button
          size="sm"
          disabled={pos.busy}
          onClick={async () => {
            await pos.admin.setStock(bSkus, 0);
            await pos.startCase(cedulaOf(data, "c-luis"));
            mark(3);
          }}
        >
          Agotar B y cargar a Luis
        </Button>
      ),
    },
    {
      title: "Ver resultados",
      text: "Revise eventos, tasas con sus denominadores y si la campaña funciona o falla.",
      action: (
        <Button size="sm" asChild onClick={() => mark(4)}>
          <Link to="/resultados">Ir a resultados</Link>
        </Button>
      ),
    },
  ];

  return (
    <section
      aria-label="Recorrido de demo"
      className="min-w-0 rounded-2xl border bg-card p-3 shadow-soft"
    >
      <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-extrabold">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-accent-foreground">
          <RouteIcon size={15} />
        </span>
        Recorrido de demo
        <span className="text-xs font-medium text-muted-foreground">· 5 pasos</span>
      </h3>
      <ol className="flex snap-x gap-3 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <li
            key={s.title}
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "flex min-w-[15.5rem] flex-1 snap-start flex-col gap-1.5 rounded-xl border p-3",
              i === current ? "border-primary bg-primary-soft" : "border-border",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black",
                  done.includes(i)
                    ? "bg-success text-primary-foreground"
                    : "bg-lime text-lime-foreground",
                )}
              >
                {done.includes(i) ? <Check size={14} /> : i + 1}
              </span>
              <p className="text-sm font-extrabold leading-tight">{s.title}</p>
            </div>
            <p className="flex-1 text-xs text-muted-foreground">{s.text}</p>
            <div>{s.action}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
