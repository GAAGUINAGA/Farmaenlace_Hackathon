import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Hourglass,
  Info,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { api, formatCents, type ResultRow, type ResultsResponse, type Verdict } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { eventTime } from "@/lib/time";

const EVENT_LABELS: Record<string, string> = {
  recommended: "Recomendada",
  presented: "Presentada",
  not_presented: "No presentada (omitida)",
  accepted: "Aceptada verbalmente",
  declined: "Rechazada",
  purchased: "Compra vinculada",
};

const NO_OBS = "sin observaciones";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string | undefined }) {
  const empty = value === NO_OBS;
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-black tabular-nums",
          empty ? "text-sm text-muted-foreground" : "text-xl",
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const pct = (rate: number | null) => (rate === null ? NO_OBS : `${Math.round(rate * 100)} %`);

const VERDICT_TITLES: Record<Verdict["status"], string> = {
  funciona: "La campaña está funcionando",
  falla: "La campaña falló",
  en_observacion: "Campaña en observación",
  sin_observaciones: "Sin observaciones",
};

/** Verde si funciona, advertencia si falla, neutro mientras faltan observaciones. */
function VerdictBanner({ verdict, compact = false }: { verdict: Verdict; compact?: boolean }) {
  const tone =
    verdict.status === "funciona"
      ? "border-success/60 bg-success/10 text-success"
      : verdict.status === "falla"
        ? "border-destructive/60 bg-danger-soft text-destructive"
        : "border-border bg-muted/60 text-foreground";
  const Icon =
    verdict.status === "funciona"
      ? CheckCircle2
      : verdict.status === "falla"
        ? AlertTriangle
        : Hourglass;
  return (
    <div
      role={verdict.status === "falla" ? "alert" : "status"}
      data-verdict={verdict.status}
      className={cn(
        "flex gap-3 rounded-2xl border-2 p-4",
        tone,
        compact && "rounded-xl border p-3",
      )}
    >
      <Icon className={cn("mt-0.5 shrink-0", compact ? "h-4 w-4" : "h-6 w-6")} aria-hidden="true" />
      <div>
        <p className={cn("font-black", compact ? "text-sm" : "text-lg")}>
          {VERDICT_TITLES[verdict.status]}
        </p>
        <p className={cn("text-foreground", compact ? "text-xs" : "text-sm")}>{verdict.message}</p>
      </div>
    </div>
  );
}

function AudienceCard({ row }: { row: ResultRow }) {
  return (
    <Card className="grid min-w-0 gap-4 rounded-2xl p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-black">Audiencia: {row.audience_label}</h3>
          <p className="text-xs text-muted-foreground">
            {row.campaign_name} · objetivo: {row.objective_label}
          </p>
        </div>
        <Badge variant={row.evidence === "sin_observaciones" ? "outline" : "secondary"}>
          {row.evidence === "sin_observaciones"
            ? "Sin observaciones"
            : row.evidence === "insuficiente"
              ? "Evidencia insuficiente para concluir"
              : "Evidencia mínima, observacional"}
        </Badge>
      </div>

      <VerdictBanner verdict={row.verdict} compact />

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Recomendaciones" value={String(row.recommendations)} />
        <Stat
          label="Presentaciones"
          value={String(row.presented)}
          sub={`${row.not_presented} omitidas`}
        />
        <Stat
          label="Respuestas conocidas"
          value={String(row.responses)}
          sub={`${row.accepted} aceptadas · ${row.declined} rechazadas`}
        />
        <Stat label="Compras vinculadas" value={String(row.purchases)} />
        <Stat
          label="Tasa de presentación"
          value={pct(row.presentation_rate)}
          sub={row.recommendations > 0 ? `${row.presented} de ${row.recommendations}` : undefined}
        />
        <Stat
          label="Compra tras exposición"
          value={pct(row.purchase_rate)}
          sub={row.presented > 0 ? `${row.purchases} de ${row.presented}` : undefined}
        />
        <Stat
          label="Contribución simulada"
          value={row.purchases > 0 ? formatCents(row.contribution_cents) : NO_OBS}
          sub="unidad promocionada"
        />
      </dl>

      <div className="rounded-xl border border-lime bg-accent p-3 text-accent-foreground">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase">
          <FlaskConical size={14} /> Propuesta de la siguiente prueba
        </p>
        <p className="text-sm">{row.proposal}</p>
        <p className="mt-2 text-xs font-semibold">{row.evidence_note}</p>
      </div>
    </Card>
  );
}

export function ResultsView() {
  const [res, setRes] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRes(await api.getResults());
      setError(null);
    } catch {
      setError("No se pudieron cargar los resultados.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadScenario = async (kind: "funciona" | "falla") => {
    setBusy(true);
    try {
      const n = await api.seedScenario(kind);
      await load();
      toast.success(`Se generaron ${n} ventas de ejemplo (datos ficticios).`);
    } catch {
      toast.error("No se pudo generar el escenario de ejemplo.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    await api.resetDemo();
    await load();
    setBusy(false);
    toast.success("Demo reiniciada: datos, stock y eventos restaurados.");
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Resultados para Comercial</h1>
          <p className="text-sm text-muted-foreground">
            Eventos y propuesta de la siguiente prueba, por campaña y audiencia.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-10" asChild>
            <Link to="/demo">
              <ShoppingCart /> Volver a la demo
            </Link>
          </Button>
          <Button variant="outline" className="h-10" disabled={busy} onClick={reset}>
            <RotateCcw /> Reiniciar demo
          </Button>
        </div>
      </div>

      {res && <VerdictBanner verdict={res.overall} />}

      <Alert className="border-primary/40 bg-primary-soft">
        <Info className="h-4 w-4" />
        <AlertTitle>Datos ficticios · observacional · sin evidencia causal</AlertTitle>
        <AlertDescription>
          Estos conteos provienen de una simulación en este navegador. Muestran oportunidades de
          interacción, no demuestran incremento de ventas, participación de mercado ni rentabilidad,
          y no deben usarse para elegir una promoción ganadora.
        </AlertDescription>
      </Alert>

      <section
        aria-label="Escenarios de ejemplo"
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed p-3 text-sm"
      >
        <span className="mr-auto text-muted-foreground">
          ¿Pocas ventas? Genere 9 ventas de ejemplo (datos ficticios) para ver cada lectura:
        </span>
        <Button
          variant="outline"
          className="h-10"
          disabled={busy}
          onClick={() => loadScenario("funciona")}
        >
          Ejemplo: campaña que funciona
        </Button>
        <Button
          variant="outline"
          className="h-10"
          disabled={busy}
          onClick={() => loadScenario("falla")}
        >
          Ejemplo: campaña que falla
        </Button>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!res && !error && (
        <div className="grid gap-3" role="status" aria-label="Cargando resultados">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      )}

      {res && (
        <>
          <section aria-label="Por audiencia" className="grid gap-4">
            {res.rows.map((r) => (
              <AudienceCard key={`${r.campaign_id}-${r.audience}`} row={r} />
            ))}
          </section>

          <section aria-label="Definiciones" className="rounded-2xl border p-4 text-sm">
            <h2 className="mb-2 text-sm font-extrabold">Cómo leer estos números</h2>
            <ul className="grid list-disc gap-1 pl-5 text-muted-foreground">
              <li>Tasa de presentación = presentadas ÷ recomendaciones.</li>
              <li>Tasa de compra tras exposición = oportunidades con compra ÷ presentadas.</li>
              <li>Si el denominador es 0 se muestra «sin observaciones», no un porcentaje.</li>
              {res.notices.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>

          <section aria-label="Eventos" className="grid gap-2">
            <h2 className="text-lg font-black">Eventos registrados ({res.events.length})</h2>
            {res.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay eventos. Haga el recorrido en la demo y vuelva aquí.
              </p>
            ) : (
              <Card className="rounded-2xl p-2 shadow-soft">
                <ol className="max-h-96 divide-y overflow-y-auto px-2">
                  {res.events.map((e) => (
                    <li
                      key={e.event_id}
                      className="flex flex-wrap items-center gap-x-2 gap-y-0.5 py-2 text-sm"
                    >
                      <Badge variant={e.type === "purchased" ? "default" : "secondary"}>
                        {EVENT_LABELS[e.type] ?? e.type}
                      </Badge>
                      <span>
                        {e.customer_id} · {e.promotion_id}
                      </span>
                      <span className="w-full text-xs text-muted-foreground sm:ml-auto sm:w-auto">
                        {eventTime(e.at)} · {e.recommendation_id} · reglas {e.rules_version} ·
                        campaña v{e.campaign_version}
                        {e.transaction_id ? ` · ${e.transaction_id}` : ""}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </section>

          <section aria-label="Transacciones" className="grid gap-2">
            <h2 className="text-lg font-black">
              Transacciones simuladas ({res.transactions.length})
            </h2>
            {res.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay compras confirmadas.</p>
            ) : (
              <Card className="rounded-2xl p-2 shadow-soft">
                <ul className="max-h-72 divide-y overflow-y-auto px-2">
                  {res.transactions.map((t) => (
                    <li key={t.transaction_id} className="py-2 text-sm">
                      <b>{t.transaction_id}</b> · {t.customer_id} · total{" "}
                      {formatCents(t.total_cents)} ·{" "}
                      {t.promotion_applied
                        ? `promoción ${t.promotion_id} (contribución ${formatCents(t.contribution_cents)})`
                        : "precio normal, sin promoción"}
                      {t.reason && (
                        <span className="block text-xs text-muted-foreground">{t.reason}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>
          {!res.persistent && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info size={12} /> Almacenamiento local no disponible: los datos se pierden al
              recargar.
            </p>
          )}
        </>
      )}
    </div>
  );
}
