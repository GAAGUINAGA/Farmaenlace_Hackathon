import { formatCents, formatRatio } from "./format";
import { contributionCents, hardFilter } from "./filters";
import { computeScore, toPct } from "./score";
import type { Decision, Discard, EngineInput, Ranked } from "./types";

export const RULES_VERSION = "v1";

function rankOne(input: EngineInput, promoId: string): Ranked | null {
  const promo = input.promotions.find((p) => p.id === promoId);
  const product = promo && input.products.find((p) => p.sku === promo.sku);
  const item = input.campaign.items.find((i) => i.promotion_id === promoId);
  if (!promo || !product || !item) return null;

  const segment = item.segment_id
    ? input.segments.find((s) => s.id === item.segment_id)
    : undefined;
  const known = item.segment_id ? input.customer.affinities[item.segment_id] : undefined;
  const customerHasAffinities = Object.keys(input.customer.affinities).length > 0;
  const affinityPct = known === undefined ? 0 : toPct(known);

  const inBasket = input.basket.some((l) => l.sku === promo.sku && l.quantity > 0);
  const allowed = input.campaign.allowed_categories.includes(product.category);
  const relevancePct = inBasket ? 100 : allowed ? 50 : 0;
  const priorityPct = toPct(item.priority);
  const contribution = contributionCents(promo, product);

  const reasons: string[] = [];
  if (known !== undefined && segment)
    reasons.push(`Afinidad conocida con ${segment.name} (${formatRatio(affinityPct)})`);
  else if (!item.segment_id && customerHasAffinities)
    reasons.push("Promoción sin segmento asociado (afinidad 0)");
  else reasons.push("Afinidad desconocida (se usa 0)");
  reasons.push(
    inBasket
      ? "Producto en canasta"
      : allowed
        ? `Categoría permitida: ${product.category}`
        : "Sin relación con la canasta",
  );
  reasons.push(
    `Prioridad comercial ${formatRatio(priorityPct)}${item.assumed ? " (supuesto)" : ""}`,
  );
  reasons.push("Campaña aprobada");
  reasons.push(`Contribución ${formatCents(contribution)} por unidad, sobre el piso`);

  return {
    promotion_id: promo.id,
    label: promo.label,
    sku: promo.sku,
    product_name: product.name,
    score: computeScore(input.campaign.objective, affinityPct, relevancePct, priorityPct),
    affinity_pct: affinityPct,
    relevance_pct: relevancePct,
    priority_pct: priorityPct,
    price_before_cents: product.price_cents,
    price_after_cents: promo.promo_price_cents,
    contribution_cents: contribution,
    reasons,
  };
}

/** Mayor score, luego mayor contribución, luego menor ID. Regla fija y visible. */
export const compareRanked = (a: Ranked, b: Ranked) =>
  b.score - a.score ||
  b.contribution_cents - a.contribution_cents ||
  (a.promotion_id < b.promotion_id ? -1 : a.promotion_id > b.promotion_id ? 1 : 0);

export function decide(input: EngineInput): Decision {
  // 1. Candidatos = recomendaciones existentes ∩ promociones disponibles.
  const candidates = input.promotions.filter((p) => input.recommended_skus.includes(p.sku));

  // 2. Filtros duros antes del ranking.
  const discarded: Discard[] = [];
  const valid: Ranked[] = [];
  for (const promo of candidates) {
    const product = input.products.find((p) => p.sku === promo.sku);
    if (!product) continue;
    const discard = hardFilter(input, promo, product);
    if (discard) {
      discarded.push(discard);
      continue;
    }
    const ranked = rankOne(input, promo.id);
    if (ranked) valid.push(ranked);
  }

  // 3. Score solo de candidatos válidos y desempate.
  const ranking = valid.sort(compareRanked);
  const winner = ranking[0] ?? null;
  const base = {
    objective: input.campaign.objective,
    ranking,
    discarded,
    score_type: "configured_rules" as const,
    rules_version: RULES_VERSION,
  };
  if (!winner) {
    return {
      ...base,
      decision: "no_offer",
      winner: null,
      message: null,
      no_offer_reason: candidates.length
        ? "Todas las promociones candidatas fueron descartadas por las reglas de elegibilidad."
        : "No hay promociones disponibles para los productos recomendados.",
    };
  }
  return {
    ...base,
    decision: "offer",
    winner,
    message: input.campaign.message,
    no_offer_reason: null,
  };
}

/** Revalida solo los filtros duros de una promoción (no vuelve a rankear). */
export function revalidate(input: EngineInput, promotionId: string): Discard | null {
  const promo = input.promotions.find((p) => p.id === promotionId);
  const product = promo && input.products.find((p) => p.sku === promo.sku);
  if (!promo || !product) {
    return {
      promotion_id: promotionId,
      label: "?",
      sku: "",
      code: "promotion_not_in_campaign",
      reason: "Promoción no encontrada",
    };
  }
  return hardFilter(input, promo, product);
}
