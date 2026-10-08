import { ListChecks, ShoppingBasket, UserRound } from "lucide-react";

import { formatCents, formatRatio, type DemoData } from "@/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PosDemoState } from "./usePosDemo";
import { Panel, QuantityStepper } from "./Panel";

export function CustomerPicker({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  const affinityText = (c: DemoData["customers"][number]) => {
    const parts = Object.entries(c.affinities).map(
      ([id, v]) =>
        `${data.segments.find((s) => s.id === id)?.name ?? id} ${formatRatio(Math.round(v * 100))}`,
    );
    return parts.length ? parts.join(" · ") : "Afinidad desconocida";
  };
  return (
    <Panel title="Cliente" icon={UserRound}>
      <div role="radiogroup" aria-label="Cliente ficticio" className="grid gap-2">
        {data.customers.map((c) => {
          const on = c.id === pos.customerId;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={pos.busy}
              onClick={() => pos.setCustomerId(c.id)}
              className={cn(
                "flex min-h-14 items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-60",
                on ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-secondary",
              )}
            >
              <span className="min-w-0">
                <span className="block text-sm font-extrabold">
                  {c.name} <span className="font-medium text-muted-foreground">· {c.id}</span>
                </span>
                <span className="block text-xs text-muted-foreground">{affinityText(c)}</span>
              </span>
              <Badge variant={c.membership_active ? "default" : "secondary"} className="shrink-0">
                {c.membership_active ? "Membresía activa" : "Sin membresía"}
              </Badge>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Afinidades precargadas y ficticias. No se infieren de medicamentos ni de salud.
      </p>
    </Panel>
  );
}

export function BasketEditor({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  return (
    <Panel title="Canasta" icon={ShoppingBasket}>
      <ul className="grid gap-2">
        {data.products.map((p) => {
          const qty = pos.basket.find((l) => l.sku === p.sku)?.quantity ?? 0;
          const stock = data.stock[p.sku] ?? 0;
          return (
            <li key={p.sku} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCents(p.price_cents)} · stock {stock}
                </p>
              </div>
              <QuantityStepper
                label={p.name}
                value={qty}
                disabled={pos.busy || pos.completed !== null}
                onChange={(q) => pos.setQuantity(p.sku, q)}
              />
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Si cambia la canasta, la acción anterior se invalida y se calcula una nueva decisión.
      </p>
    </Panel>
  );
}

export function OriginalList({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  const skus =
    data.existing_recommendations.find((r) => r.customer_id === pos.customerId)?.skus ?? [];
  const chosen = pos.card.status === "ready" ? pos.card.rec.sku : null;
  return (
    <Panel title="Listado original" icon={ListChecks}>
      <p className="mb-2 text-xs text-muted-foreground">
        Lo que hoy recibe el dependiente, sin priorizar (recomendaciones por historial).
      </p>
      <ul className="grid gap-2">
        {skus.map((sku) => {
          const product = data.products.find((p) => p.sku === sku);
          const promos = data.promotions.filter((p) => p.sku === sku);
          return (
            <li
              key={sku}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border p-2.5",
                chosen === sku ? "border-lime bg-accent" : "border-border",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{product?.name ?? sku}</p>
                <p className="text-xs text-muted-foreground">
                  {product ? formatCents(product.price_cents) : ""}
                  {promos.length > 0 && ` · Promoción ${promos.map((p) => p.label).join(", ")}`}
                </p>
              </div>
              {chosen === sku && (
                <Badge className="shrink-0 bg-lime text-lime-foreground hover:bg-lime">
                  Prioriza el asistente
                </Badge>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
