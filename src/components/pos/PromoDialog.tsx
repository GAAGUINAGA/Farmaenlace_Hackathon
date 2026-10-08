import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
  Quote,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { FAMILY_LABELS, formatCents, OBJECTIVE_LABELS, type RecommendResponse } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PosDemoState } from "./usePosDemo";

function Discards({ rec }: { rec: RecommendResponse }) {
  if (rec.discarded.length === 0) return null;
  return (
    <ul className="grid gap-1 text-xs">
      {rec.discarded.map((d) => (
        <li key={d.promotion_id} className="flex gap-1.5 text-destructive">
          <Ban size={14} className="mt-0.5 shrink-0" />
          <span>
            <b>Promoción {d.label}</b> descartada: {d.reason}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OfferView({ rec, pos }: { rec: RecommendResponse; pos: PosDemoState }) {
  const customer = pos.customer;
  const inBasket = rec.items.filter((i) => i.in_basket);
  const others = rec.items.filter((i) => !i.in_basket);
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl bg-accent p-4 text-accent-foreground">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase">
          <Sparkles size={14} /> Recomendación para el dependiente
        </p>
        <p className="text-xl font-black leading-snug">
          Puedes darle a {customer?.name} la promoción {rec.promotion_label}
          {rec.family ? ` (${FAMILY_LABELS[rec.family]})` : ""}.
        </p>
      </div>

      <section aria-label="Descuentos" className="grid gap-2">
        <h3 className="text-sm font-extrabold">Se aplican descuentos en:</h3>
        <ul className="grid gap-1.5">
          {inBasket.map((i) => (
            <li
              key={i.sku}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-lime bg-card p-2.5"
            >
              <span className="min-w-0 text-sm font-bold">
                {i.product_name} <Badge variant="secondary">en la factura</Badge>
              </span>
              <span className="text-sm tabular-nums">
                <span className="text-muted-foreground line-through">
                  {formatCents(i.price_before_cents)}
                </span>{" "}
                <b className="text-primary">{formatCents(i.price_after_cents)}</b>
              </span>
            </li>
          ))}
          {others.map((i) => (
            <li
              key={i.sku}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-2.5 text-muted-foreground"
            >
              <span className="min-w-0 text-sm">{i.product_name}</span>
              <span className="text-sm tabular-nums">
                <span className="line-through">{formatCents(i.price_before_cents)}</span>{" "}
                <b>{formatCents(i.price_after_cents)}</b>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          El descuento aplica a 1 unidad de cada producto que esté en la factura; el precio final ya
          lo incluye.
        </p>
      </section>

      <blockquote className="flex gap-2 rounded-xl bg-muted/60 p-3 text-sm">
        <Quote size={16} className="mt-0.5 shrink-0" />
        <span>
          <b className="block text-xs">Mensaje autorizado por la campaña</b>
          {rec.message}
        </span>
      </blockquote>

      <details className="rounded-xl border p-3 text-sm">
        <summary className="cursor-pointer font-bold">
          ¿Por qué esta promoción? · score {rec.score} (reglas configuradas, no una probabilidad)
        </summary>
        <ul className="mt-2 grid gap-1">
          {rec.reasons.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Objetivo: {OBJECTIVE_LABELS[rec.objective]} · campaña v{rec.campaign_version} · reglas{" "}
          {rec.rules_version}. Orden:{" "}
          {rec.ranking.map((r) => `${r.label} = ${r.score}`).join(" · ")}.
        </p>
        <div className="mt-2">
          <Discards rec={rec} />
        </div>
      </details>
    </div>
  );
}

/** Pasos del dependiente: presentar → respuesta del cliente → compra. */
function Actions({ pos }: { pos: PosDemoState }) {
  const { status, busy } = pos;
  const spin = busy ? <Loader2 className="animate-spin" /> : null;
  if (status.purchased) return null;
  if (!status.presented && !status.not_presented) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="outline" className="h-11" disabled={busy} onClick={pos.skip}>
          Omitir recomendación
        </Button>
        <Button className="h-11" disabled={busy} onClick={pos.present}>
          {spin} Presentar al cliente
        </Button>
      </div>
    );
  }
  if (status.not_presented) {
    return (
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">
          Recomendación omitida (no cuenta como rechazo). Puede cobrar a precio normal.
        </p>
        <Button className="h-11" disabled={busy} onClick={pos.confirm}>
          {spin} Cobrar sin promoción
        </Button>
      </div>
    );
  }
  if (!status.response) {
    return (
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">Presentada. ¿Qué respondió el cliente?</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" className="h-11" disabled={busy} onClick={pos.decline}>
            El cliente rechaza
          </Button>
          <Button
            className="h-11 bg-lime text-lime-foreground hover:bg-lime/80"
            disabled={busy}
            onClick={pos.accept}
          >
            {spin} El cliente acepta
          </Button>
        </div>
      </div>
    );
  }
  if (status.response === "accepted") {
    return (
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">
          Aceptar no es comprar: la compra se registra al confirmarla. Se revalidan stock, vigencia,
          membresía y piso.
        </p>
        <Button className="h-11" disabled={busy} onClick={pos.confirm}>
          {spin} Confirmar compra con la promoción
        </Button>
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">El cliente rechazó la promoción.</p>
      <Button className="h-11" disabled={busy} onClick={pos.confirm}>
        {spin} Cobrar sin promoción
      </Button>
    </div>
  );
}

function Receipt({ pos }: { pos: PosDemoState }) {
  const tx = pos.completed!;
  const t = tx.transaction;
  return (
    <div className="grid gap-3">
      <Alert className={cn(tx.promotion_applied && "border-success/50")}>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>
          {tx.promotion_applied
            ? "Venta registrada con promoción"
            : "Venta registrada a precio normal"}
        </AlertTitle>
        <AlertDescription>
          Total {formatCents(t.total_cents)}.{" "}
          {tx.promotion_applied
            ? `Contribución simulada de las unidades promocionadas: ${formatCents(t.contribution_cents)}.`
            : (tx.reason ?? "No había una promoción que aplicar.")}
        </AlertDescription>
      </Alert>
      {tx.promotion_applied && (
        <ul className="grid gap-1 text-sm">
          {t.applied.map((i) => (
            <li key={i.sku} className="flex justify-between gap-2">
              <span>{i.product_name}</span>
              <span className="tabular-nums">
                <span className="text-muted-foreground line-through">
                  {formatCents(i.price_before_cents)}
                </span>{" "}
                <b>{formatCents(i.price_after_cents)}</b>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">Transacción {t.transaction_id}.</p>
      <Button className="h-11" onClick={pos.newSale}>
        <RefreshCw /> Nueva venta
      </Button>
    </div>
  );
}

/** Pantalla emergente de la recomendación (reemplaza al panel «Acción recomendada»). */
export function PromoDialog({ pos }: { pos: PosDemoState }) {
  const { card } = pos;
  const onOpenChange = (open: boolean) => {
    if (open) return pos.setDialogOpen(true);
    if (pos.completed) pos.newSale();
    else pos.setDialogOpen(false);
  };

  let body: React.ReactNode;
  if (pos.completed) body = <Receipt pos={pos} />;
  else if (card.status === "idle" || card.status === "loading") {
    body = (
      <div className="grid gap-3" role="status" aria-label="Evaluando promociones">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-5/6" />
        <p className="text-xs text-muted-foreground">Evaluando elegibilidad y ranking…</p>
      </div>
    );
  } else if (card.status === "error") {
    body = (
      <div className="grid gap-3">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No se pudo evaluar las promociones</AlertTitle>
          <AlertDescription>
            {card.message} No se muestra ninguna oferta; el cobro normal sigue disponible.
          </AlertDescription>
        </Alert>
        <Button className="h-11" disabled={pos.busy} onClick={pos.confirm}>
          Cobrar a precio normal
        </Button>
      </div>
    );
  } else if (card.rec.decision === "no_offer") {
    body = (
      <div className="grid gap-3">
        <Alert>
          <Ban className="h-4 w-4" />
          <AlertTitle>No hay promoción para ofrecer</AlertTitle>
          <AlertDescription>{card.rec.no_offer_reason}</AlertDescription>
        </Alert>
        <Discards rec={card.rec} />
        <Button className="h-11" disabled={pos.busy} onClick={pos.confirm}>
          Cobrar a precio normal
        </Button>
      </div>
    );
  } else {
    body = (
      <div className="grid gap-4">
        <OfferView rec={card.rec} pos={pos} />
        <Actions pos={pos} />
      </div>
    );
  }

  return (
    <Dialog open={pos.dialogOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pos.completed ? "Venta registrada" : "Antes de cobrar"}</DialogTitle>
          <DialogDescription>
            {pos.completed
              ? "Resumen de la transacción simulada."
              : "Promoción sugerida por el asistente, con datos ficticios."}
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
