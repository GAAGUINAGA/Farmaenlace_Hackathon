import { OBJECTIVE_LABELS } from "./score";
import type {
  Campaign,
  Customer,
  DemoEvent,
  Objective,
  RecommendationRecord,
  Segment,
  TransactionRecord,
} from "./types";

/** Presentaciones mínimas por brazo para considerar la evidencia: supuesto visible de la demo. */
export const MIN_PRESENTATIONS = 30;
/** Lectura preliminar de la demo (supuestos visibles): mínimo de presentaciones y meta de compra. */
export const VERDICT_MIN_PRESENTATIONS = 3;
export const VERDICT_TARGET_RATE = 0.5;
export const UNKNOWN_AUDIENCE = "unknown";
export const UNKNOWN_AUDIENCE_LABEL = "Afinidad desconocida";

export type Verdict = {
  status: "sin_observaciones" | "en_observacion" | "funciona" | "falla";
  message: string;
};

export type ResultRow = {
  campaign_id: string;
  campaign_name: string;
  objective: Objective;
  objective_label: string;
  audience: string;
  audience_label: string;
  recommendations: number;
  presented: number;
  not_presented: number;
  accepted: number;
  declined: number;
  responses: number;
  purchases: number;
  /** presentadas / recomendaciones; null si el denominador es 0 ("sin observaciones"). */
  presentation_rate: number | null;
  /** oportunidades con compra / presentadas; null si el denominador es 0. */
  purchase_rate: number | null;
  /** Contribución simulada y observacional de la unidad promocionada; no es beneficio incremental. */
  contribution_cents: number;
  verdict: Verdict;
  evidence: "sin_observaciones" | "insuficiente" | "minima";
  evidence_note: string;
  proposal: string;
};

/** Audiencia = segmento de mayor afinidad conocida; "unknown" si no hay afinidades. */
export function audienceOf(customer: Customer): string {
  let best: { id: string; value: number } | null = null;
  for (const [id, value] of Object.entries(customer.affinities)) {
    if (!best || value > best.value) best = { id, value };
  }
  return best ? best.id : UNKNOWN_AUDIENCE;
}

export const audienceLabel = (audience: string, segments: Segment[]) =>
  audience === UNKNOWN_AUDIENCE
    ? UNKNOWN_AUDIENCE_LABEL
    : (segments.find((s) => s.id === audience)?.name ?? audience);

export function buildProposal(campaign: Campaign, segments: Segment[], audience: string): string {
  const label = audienceLabel(audience, segments);
  const where =
    audience === UNKNOWN_AUDIENCE
      ? "la audiencia sin afinidad conocida (canasta y prioridades generales)"
      : `el segmento ${label}`;
  if (campaign.objective === "consolidar_liderazgo") {
    return `Comparar la selección habitual frente al asistente en ${where}, con condiciones comparables. Evaluar contribución por cliente asignado. Las respuestas observadas son exploratorias y no demuestran incremento.`;
  }
  // Orden: primero la promoción asociada a la audiencia, luego las demás con segmento.
  const withSegment = campaign.items.filter((i) => i.segment_id !== null);
  const ordered = [
    ...withSegment.filter((i) => i.segment_id === audience),
    ...withSegment.filter((i) => i.segment_id !== audience),
  ];
  const labels = ordered.slice(0, 2).map((i) => i.promotion_id.replace("promo-", ""));
  const pair =
    labels.length === 2
      ? `${labels[0]} frente a ${labels[1]}`
      : (labels[0] ?? "las acciones autorizadas");
  return `Probar ${pair} en ${where} con condiciones comparables. Evaluar contribución por cliente asignado. Las respuestas observadas son exploratorias y no demuestran incremento.`;
}

type ResultsInput = {
  campaign: Campaign;
  segments: Segment[];
  recommendations: RecommendationRecord[];
  events: DemoEvent[];
  transactions: TransactionRecord[];
};

const rate = (num: number, den: number) => (den === 0 ? null : num / den);

/**
 * ¿Funciona la campaña? Lectura preliminar y observacional con la meta de compra tras exposición.
 * No es evidencia causal: solo orienta si conviene seguir con la campaña o promover otra estrategia.
 */
export function buildVerdict(where: string, presented: number, purchases: number): Verdict {
  const target = `${Math.round(VERDICT_TARGET_RATE * 100)} %`;
  if (presented === 0)
    return {
      status: "sin_observaciones",
      message: `Sin observaciones: todavía no se ha presentado la promoción ${where}.`,
    };
  if (presented < VERDICT_MIN_PRESENTATIONS)
    return {
      status: "en_observacion",
      message: `Faltan observaciones ${where}: ${presented} de ${VERDICT_MIN_PRESENTATIONS} presentaciones necesarias para una lectura preliminar.`,
    };
  const base = `${purchases} de ${presented} clientes que vieron la promoción compraron (meta de la demo: ${target})`;
  return purchases / presented >= VERDICT_TARGET_RATE
    ? {
        status: "funciona",
        message: `La campaña está funcionando ${where}: ${base}. Es una lectura preliminar con datos ficticios; no demuestra incremento.`,
      }
    : {
        status: "falla",
        message: `La campaña falló ${where}: solo ${base}. Se debería promover otra estrategia (otra promoción, otro mensaje u otra audiencia) antes de seguir con esta.`,
      };
}

/** Veredicto de toda la campaña, sumando las audiencias. */
export function overallVerdict(rows: ResultRow[]): Verdict {
  const presented = rows.reduce((n, r) => n + r.presented, 0);
  const purchases = rows.reduce((n, r) => n + r.purchases, 0);
  return buildVerdict("en conjunto", presented, purchases);
}

export function aggregateResults(input: ResultsInput): ResultRow[] {
  const { campaign, segments } = input;
  const eventsByRec = new Map<string, Set<string>>();
  for (const e of input.events) {
    const set = eventsByRec.get(e.recommendation_id) ?? new Set<string>();
    set.add(e.type);
    eventsByRec.set(e.recommendation_id, set);
  }
  const audiences = [...segments.map((s) => s.id), UNKNOWN_AUDIENCE];
  const recAudience = new Map(input.recommendations.map((r) => [r.recommendation_id, r.audience]));

  return audiences.map((audience) => {
    // Oportunidades: ofertas no reemplazadas, o reemplazadas pero ya presentadas/omitidas.
    const recs = input.recommendations.filter((r) => {
      if (r.campaign_id !== campaign.id || r.audience !== audience) return false;
      if (r.decision.decision !== "offer") return false;
      const types = eventsByRec.get(r.recommendation_id) ?? new Set<string>();
      return !r.superseded || types.has("presented") || types.has("not_presented");
    });
    const has = (id: string, type: string) => eventsByRec.get(id)?.has(type) ?? false;
    const count = (type: string) => recs.filter((r) => has(r.recommendation_id, type)).length;

    const presented = count("presented");
    const accepted = count("accepted");
    const declined = count("declined");
    const purchases = recs.filter(
      (r) => has(r.recommendation_id, "presented") && has(r.recommendation_id, "purchased"),
    ).length;
    const contribution = input.transactions
      .filter(
        (t) =>
          t.promotion_applied &&
          t.recommendation_id !== null &&
          recAudience.get(t.recommendation_id) === audience &&
          recs.some((r) => r.recommendation_id === t.recommendation_id),
      )
      .reduce((sum, t) => sum + t.contribution_cents, 0);

    const evidence: ResultRow["evidence"] =
      presented === 0
        ? "sin_observaciones"
        : presented < MIN_PRESENTATIONS
          ? "insuficiente"
          : "minima";
    const evidence_note =
      evidence === "sin_observaciones"
        ? "Sin observaciones: aún no hay presentaciones en esta audiencia."
        : evidence === "insuficiente"
          ? `Evidencia insuficiente (${presented} ${presented === 1 ? "presentación" : "presentaciones"}; referencia de la demo: ${MIN_PRESENTATIONS} por opción). No se elige una ganadora.`
          : "Hay presentaciones suficientes para diseñar la prueba, pero los datos siguen siendo observacionales: no se elige una ganadora.";

    return {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      objective: campaign.objective,
      objective_label: OBJECTIVE_LABELS[campaign.objective],
      audience,
      audience_label: audienceLabel(audience, segments),
      recommendations: recs.length,
      presented,
      not_presented: count("not_presented"),
      accepted,
      declined,
      responses: accepted + declined,
      purchases,
      presentation_rate: rate(presented, recs.length),
      purchase_rate: rate(purchases, presented),
      contribution_cents: contribution,
      verdict: buildVerdict(`en ${audienceLabel(audience, segments)}`, presented, purchases),
      evidence,
      evidence_note,
      proposal: buildProposal(campaign, segments, audience),
    };
  });
}
