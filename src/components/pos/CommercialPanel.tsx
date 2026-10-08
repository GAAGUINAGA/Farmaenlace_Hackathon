import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { formatRatio, OBJECTIVE_LABELS, WEIGHTS, type DemoData, type Objective } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { PosDemoState } from "./usePosDemo";
import { Panel } from "./Panel";

const OBJECTIVES = Object.keys(OBJECTIVE_LABELS) as Objective[];

export function CommercialPanel({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  const [open, setOpen] = useState(false);
  const { admin, busy } = pos;
  const objective = data.config.objective;
  const [wA, wP, wR] = WEIGHTS[objective];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Panel
        title="Configuración de Comercial"
        icon={SlidersHorizontal}
        action={
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Mostrar u ocultar configuración">
              {open ? "Ocultar" : "Mostrar"}
              <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
        }
      >
        <p className="text-xs text-muted-foreground">
          Cambie el objetivo, las prioridades o el stock y observe cómo se recalcula la acción.
          Campaña v{data.config.campaign_version}.
        </p>
        <CollapsibleContent>
          <div className="mt-4 grid gap-5">
            <section aria-label="Objetivo" className="grid gap-2">
              <h4 className="text-xs font-extrabold uppercase text-muted-foreground">Objetivo</h4>
              <div
                role="radiogroup"
                aria-label="Objetivo comercial"
                className="grid grid-cols-2 gap-2"
              >
                {OBJECTIVES.map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={o === objective}
                    disabled={busy}
                    onClick={() => admin.setObjective(o)}
                    className={cn(
                      "min-h-11 rounded-xl border px-3 py-2 text-sm font-bold transition-colors disabled:opacity-60",
                      o === objective
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    {OBJECTIVE_LABELS[o]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Pesos (supuestos configurables): afinidad {wA / 100}, pertinencia {wP / 100},
                prioridad {wR / 100}.
              </p>
            </section>

            <section aria-label="Prioridades" className="grid gap-3">
              <h4 className="text-xs font-extrabold uppercase text-muted-foreground">
                Prioridad comercial por promoción
              </h4>
              {data.campaign.items.map((item) => {
                const promo = data.promotions.find((p) => p.id === item.promotion_id);
                const pct = Math.round(item.priority * 100);
                return (
                  <div key={item.promotion_id} className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-bold">
                        Promoción {promo?.label}
                        {item.assumed && (
                          <Badge variant="outline" className="ml-2">
                            supuesto
                          </Badge>
                        )}
                      </span>
                      <span className="tabular-nums">{formatRatio(pct)}</span>
                    </div>
                    <Slider
                      key={`${item.promotion_id}-${pct}`}
                      defaultValue={[pct]}
                      min={0}
                      max={100}
                      step={5}
                      disabled={busy}
                      aria-label={`Prioridad de la promoción ${promo?.label}`}
                      onValueCommit={([v]) =>
                        v !== undefined && admin.setPriority(item.promotion_id, v / 100)
                      }
                    />
                  </div>
                );
              })}
            </section>

            <section aria-label="Vigencia" className="grid gap-2">
              <h4 className="text-xs font-extrabold uppercase text-muted-foreground">Vigencia</h4>
              {data.promotions.map((p) => (
                <label key={p.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    <b>Promoción {p.label}</b>{" "}
                    <span className="text-muted-foreground">
                      · {p.status === "approved" ? "aprobada y vigente" : "vencida"}
                    </span>
                  </span>
                  <Switch
                    checked={p.status === "approved"}
                    disabled={busy}
                    aria-label={`Promoción ${p.label} vigente`}
                    onCheckedChange={(on) =>
                      admin.setPromoStatus(p.id, on ? "approved" : "expired")
                    }
                  />
                </label>
              ))}
            </section>

            <section aria-label="Stock" className="grid gap-2">
              <h4 className="text-xs font-extrabold uppercase text-muted-foreground">
                Stock por promoción
              </h4>
              {data.promotions.map((promo) => {
                const skus = promo.items.map((i) => i.sku);
                const soldOut = skus.every((sku) => (data.stock[sku] ?? 0) === 0);
                return (
                  <div key={promo.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <b>Promoción {promo.label}</b>{" "}
                      <span className="text-muted-foreground">
                        · {soldOut ? "agotada" : `${skus.length} productos con stock`}
                      </span>
                    </span>
                    {soldOut ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => admin.setStock(skus, 10)}
                      >
                        Reponer a 10
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => admin.setStock(skus, 0)}
                      >
                        Agotar stock
                      </Button>
                    )}
                  </div>
                );
              })}
            </section>

            <section aria-label="Pruebas de error" className="grid gap-2">
              <h4 className="text-xs font-extrabold uppercase text-muted-foreground">
                Herramientas de demo
              </h4>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <b>Simular fallo del motor</b>
                  <span className="block text-xs text-muted-foreground">
                    No se inventa ninguna oferta; la compra normal sigue funcionando.
                  </span>
                </span>
                <Switch
                  checked={data.failure_mode}
                  disabled={busy}
                  aria-label="Simular fallo del motor"
                  onCheckedChange={admin.setFailure}
                />
              </label>
            </section>
          </div>
        </CollapsibleContent>
      </Panel>
    </Collapsible>
  );
}
