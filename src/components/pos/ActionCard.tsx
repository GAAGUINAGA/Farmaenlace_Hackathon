import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
  Quote,
  RefreshCw,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import {
  formatCents,
  OBJECTIVE_LABELS,
  WEIGHTS,
  type DemoData,
  type RecommendResponse,
} from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PosDemoState } from "./usePosDemo";
import { Panel } from "./Panel";

function ResponseStatus({ pos }: { pos: PosDemoState }) {
  const s = pos.status;
  const parts = [
    s.presented
      ? "Presentada"
      : s.not_presented
        ? "Omitida (no cuenta como rechazo)"
        : "Sin presentar",
    s.response === "accepted"
      ? "Aceptada verbalmente (no es compra)"
      : s.response === "declined"
        ? "Rechazada"
        : null,
  ].filter(Boolean);
  return (
    <p className="text-xs text-muted-foreground" aria-live="polite">
      Estado: <b className="text-foreground">{parts.join(" · ")}</b>
    </p>
  );
}

function PurchaseButton({ pos, hint }: { pos: PosDemoState; hint: string }) {
  return (
    <div className="grid gap-1.5">
      <Button
        size="lg"
        className="h-11 w-full bg-navy text-primary-foreground hover:bg-navy/90"
        disabled={pos.busy}
        onClick={pos.confirm}
      >
        {pos.busy ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
        Confirmar compra
      </Button>
      <p className="text-center text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function OfferBody({ rec, data }: { rec: RecommendResponse; data: DemoData }) {
  const [wA, wP, wR] = WEIGHTS[rec.objective];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge className="bg-lime text-lime-foreground hover:bg-lime">
              <Sparkles size={12} className="mr-1" />
              Promoción {rec.promotion_label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {OBJECTIVE_LABELS[rec.objective]} · campaña v{rec.campaign_version} · reglas{" "}
              {rec.rules_version}
            </span>
          </div>
          <h4 className="text-xl font-black leading-tight">{rec.product_name}</h4>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="text-muted-foreground line-through">
              {formatCents(rec.price_before_cents ?? 0)}
            </span>
            <span className="text-2xl font-black text-primary">
              {formatCents(rec.price_after_cents ?? 0)}
            </span>
            <span className="text-xs text-muted-foreground">
              (el precio final ya incluye el descuento)
            </span>
          </p>
        </div>
        <div className="rounded-2xl bg-primary-soft px-4 py-2 text-center">
          <p
            className="text-3xl font-black leading-none text-primary"
            aria-label={`Score ${rec.score}`}
          >
            {rec.score}
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-tight text-muted-foreground">
            score de reglas
            <br />
            (no es una probabilidad)
          </p>
        </div>
      </div>

      <ul className="grid gap-1.5" aria-label="Razones">
        {rec.reasons.map((r) => (
          <li key={r} className="flex items-start gap-2 text-sm">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            {r}
          </li>
        ))}
      </ul>

      <blockquote className="flex gap-2 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
        <Quote size={16} className="mt-0.5 shrink-0" />
        <span>
          <b className="block text-xs">Mensaje autorizado por la campaña</b>
          {rec.message}
        </span>
      </blockquote>

      <details className="rounded-xl border p-3 text-sm">
        <summary className="cursor-pointer font-bold">
          Ver cómo se ordenó ({rec.ranking.length} válidas, {rec.discarded.length} descartadas)
        </summary>
        <p className="mt-2 text-xs text-muted-foreground">
          score = 100 × ({wA / 100} afinidad + {wP / 100} pertinencia + {wR / 100} prioridad).
          Empate: mayor contribución y luego menor ID. Piso de contribución:{" "}
          {formatCents(data.floor_cents)} por unidad.
        </p>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 pr-2 font-semibold">Promoción</th>
              <th className="py-1 pr-2 font-semibold">Score</th>
              <th className="py-1 font-semibold">Contribución</th>
            </tr>
          </thead>
          <tbody>
            {rec.ranking.map((r, i) => (
              <tr key={r.promotion_id} className={cn("border-t", i === 0 && "font-bold")}>
                <td className="py-1 pr-2">
                  {r.label} · {r.product_name}
                </td>
                <td className="py-1 pr-2">{r.score}</td>
                <td className="py-1">{formatCents(r.contribution_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rec.discarded.length > 0 && (
          <ul className="mt-2 grid gap-1 text-xs">
            {rec.discarded.map((d) => (
              <li key={d.promotion_id} className="flex gap-1.5 text-destructive">
                <Ban size={14} className="mt-0.5 shrink-0" />
                <span>
                  <b>Promoción {d.label}</b> descartada: {d.reason}
                </span>
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}

export function ActionCard({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  const { card, status } = pos;
  const tx = pos.completed;

  if (tx) {
    const t = tx.transaction;
    return (
      <Panel title="Compra confirmada" icon={CheckCircle2}>
        <div className="grid gap-3">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>
              {tx.promotion_applied
                ? `Compra confirmada con la promoción ${data.promotions.find((p) => p.id === t.promotion_id)?.label ?? ""}`
                : "Compra confirmada a precio normal"}
            </AlertTitle>
            <AlertDescription>
              {tx.promotion_applied
                ? `Total ${formatCents(t.total_cents)}${t.added_unit ? " (incluye 1 unidad adicional a precio promocional)" : ""}. Contribución simulada de la unidad promocionada: ${formatCents(t.contribution_cents)}.`
                : `Total ${formatCents(t.total_cents)}. ${tx.reason ?? "No había una oferta que aplicar."}`}
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground">
            Transacción {t.transaction_id}
            {tx.deduplicated ? " (repetida: no se duplicó)" : ""}.
          </p>
          <Button onClick={pos.newPurchase} className="h-11">
            <RefreshCw /> Nueva compra
          </Button>
        </div>
      </Panel>
    );
  }

  if (card.status === "idle" || card.status === "loading") {
    return (
      <Panel title="Acción recomendada" icon={Sparkles}>
        <div className="grid gap-3" role="status" aria-label="Evaluando promociones">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <p className="text-xs text-muted-foreground">Evaluando elegibilidad y ranking…</p>
        </div>
      </Panel>
    );
  }

  if (card.status === "error") {
    return (
      <Panel title="Acción recomendada" icon={Sparkles}>
        <div className="grid gap-3">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No se pudo evaluar las promociones</AlertTitle>
            <AlertDescription>
              {card.message} No se muestra ninguna oferta; el flujo de compra normal sigue
              disponible.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={pos.retry} className="h-10">
            <RefreshCw /> Reintentar
          </Button>
          <PurchaseButton pos={pos} hint="Compra a precio normal, sin promoción." />
        </div>
      </Panel>
    );
  }

  const rec = card.rec;
  if (rec.decision === "no_offer") {
    return (
      <Panel title="Acción recomendada" icon={Sparkles}>
        <div className="grid gap-3">
          <Alert>
            <Ban className="h-4 w-4" />
            <AlertTitle>Sin oferta</AlertTitle>
            <AlertDescription>{rec.no_offer_reason}</AlertDescription>
          </Alert>
          {rec.discarded.length > 0 && (
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
          )}
          <PurchaseButton pos={pos} hint="Compra a precio normal, sin promoción." />
        </div>
      </Panel>
    );
  }

  const canPresent = !status.presented && !status.not_presented && !pos.busy;
  const canRespond = status.presented && !status.response && !pos.busy;
  return (
    <Panel title="Acción recomendada" icon={Sparkles} className="border-primary/40">
      <div className="grid gap-4">
        <OfferBody rec={rec} data={data} />
        <div className="grid gap-2 border-t pt-4">
          <ResponseStatus pos={pos} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button className="h-10" disabled={!canPresent} onClick={pos.present}>
              Presentar
            </Button>
            <Button variant="outline" className="h-10" disabled={!canPresent} onClick={pos.skip}>
              Omitir
            </Button>
            <Button
              className="h-10 bg-lime text-lime-foreground hover:bg-lime/80"
              disabled={!canRespond}
              onClick={pos.accept}
            >
              Aceptar
            </Button>
            <Button variant="outline" className="h-10" disabled={!canRespond} onClick={pos.decline}>
              Rechazar
            </Button>
          </div>
          <PurchaseButton
            pos={pos}
            hint="Al confirmar se revalidan stock, vigencia, membresía y piso. Aceptar no es comprar."
          />
        </div>
      </div>
    </Panel>
  );
}
