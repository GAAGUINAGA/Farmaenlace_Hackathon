import { CheckCircle2, Circle, Loader2, Receipt, UserRound } from "lucide-react";

import { FAMILY_LABELS, formatCents, type DemoData } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PosDemoState } from "./usePosDemo";
import { Panel, QuantityStepper } from "./Panel";

/** Factura en curso: cliente, líneas, requisito de la demostración y totales. */
export function Invoice({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  const { customer, card, status } = pos;
  if (!customer) return null;

  const lines = pos.basket
    .map((l) => ({ ...l, product: data.products.find((p) => p.sku === l.sku) }))
    .filter((l) => l.product !== undefined);
  const subtotal = lines.reduce((n, l) => n + l.quantity * (l.product?.price_cents ?? 0), 0);
  const locked = pos.completed !== null;

  // Descuento pendiente: solo cuando el cliente aceptó. Los precios salen de la respuesta de la API.
  const rec = card.status === "ready" && card.rec.decision === "offer" ? card.rec : null;
  const pendingDiscount =
    rec && status.response === "accepted" && !locked
      ? rec.items
          .filter((i) => i.in_basket)
          .reduce((n, i) => n + (i.price_before_cents - i.price_after_cents), 0)
      : 0;
  const done = pos.completed?.transaction;
  const total = done ? done.total_cents : subtotal - pendingDiscount;
  const required = customer.required_family;

  return (
    <Panel
      title="Factura"
      icon={Receipt}
      action={
        <Button variant="ghost" size="sm" disabled={pos.busy} onClick={pos.newSale}>
          Cambiar cliente
        </Button>
      }
    >
      <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-muted/60 p-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          <UserRound size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold">{customer.name}</p>
          <p className="text-xs tabular-nums text-muted-foreground">C.I. {customer.cedula}</p>
        </div>
        <Badge
          variant={customer.membership_active ? "default" : "secondary"}
          className="ml-auto shrink-0"
        >
          {customer.membership_active ? "Membresía activa" : "Sin membresía"}
        </Badge>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          La factura está vacía. Agregue productos desde la lista.
        </p>
      ) : (
        <ul className="divide-y" aria-label="Líneas de la factura">
          {lines.map((l) => (
            <li key={l.sku} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{l.product?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCents(l.product?.price_cents ?? 0)} c/u ·{" "}
                  <b className="text-foreground">
                    {formatCents(l.quantity * (l.product?.price_cents ?? 0))}
                  </b>
                </p>
              </div>
              <QuantityStepper
                label={l.product?.name ?? l.sku}
                value={l.quantity}
                disabled={pos.busy || locked}
                onChange={(q) => pos.setQuantity(l.sku, q)}
              />
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-3 grid gap-1 border-t pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatCents(subtotal)}</dd>
        </div>
        {(pendingDiscount > 0 || (done && done.promotion_applied)) && (
          <div className="flex justify-between text-success">
            <dt>
              Promoción{" "}
              {rec?.promotion_label ??
                data.promotions.find((p) => p.id === done?.promotion_id)?.label}
              {done ? "" : " (se aplica al cobrar)"}
            </dt>
            <dd className="tabular-nums">
              −{formatCents(done ? subtotal - done.total_cents : pendingDiscount)}
            </dd>
          </div>
        )}
        <div className="flex justify-between text-lg font-black">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatCents(total)}</dd>
        </div>
      </dl>

      {!locked && (
        <div className="mt-3 grid gap-2">
          <p
            className={`flex items-start gap-2 rounded-xl p-2.5 text-sm ${
              pos.requiredFamilyInBasket ? "bg-accent text-accent-foreground" : "bg-muted/60"
            }`}
            aria-live="polite"
          >
            {pos.requiredFamilyInBasket ? (
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success" />
            ) : (
              <Circle size={17} className="mt-0.5 shrink-0 text-muted-foreground" />
            )}
            <span>
              Para esta demostración, agregue al menos un producto de{" "}
              <b>{FAMILY_LABELS[required]}</b>.
            </span>
          </p>
          <Button
            size="lg"
            className="h-12 w-full text-base"
            disabled={pos.busy || !pos.requiredFamilyInBasket}
            onClick={pos.finalize}
          >
            {pos.busy && card.status === "loading" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Receipt />
            )}
            Finalizar venta
          </Button>
        </div>
      )}
    </Panel>
  );
}
