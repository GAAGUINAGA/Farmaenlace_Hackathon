import { formatCents, formatRatio } from "./format";
import { applicableItems, contributionCents, hardFilter } from "./filters";
import { computeScore, toPct } from "./score";
import type { Decision, Discard, EngineInput, Ranked, RankedItem } from "./types";

export const RULES_VERSION = "v1";

function rankOne(input: EngineInput, promoId: string): Ranked | null {
  const promo = input.promotions.find((p) => p.id === promoId);
  const campaignItem = input.campaign.items.find((i) => i.promotion_id === promoId);
  if (!promo || !campaignItem) return null;

  const items: RankedItem[] = applicableItems(input, promo).flatMap((item) => {
    const product = input.products.find((p) => p.sku === item.sku);
    if (!product) return [];
    return [
      {
        sku: item.sku,
        product_name: product.name,
        price_before_cents: product.price_cents,
        price_after_cents: item.promo_price_cents,
        contribution_cents: contributionCents(item, product),
        in_basket: input.basket.some((l) => l.sku === item.sku && l.quantity > 0),
      },
    ];
  });
  if (items.length === 0) return null;

  const segment = campaignItem.segment_id
    ? input.segments.find((s) => s.id === campaignItem.segment_id)
    : undefined;
  const known = campaignItem.segment_id
    ? input.customer.affinities[campaignItem.segment_id]
    : undefined;
  const customerHasAffinities = Object.keys(input.customer.affinities).length > 0;
  const affinityPct = known === undefined ? 0 : toPct(known);

  const inBasket = items.filter((i) => i.in_basket);
  const allowed = items.some((i) => {
    const product = input.products.find((p) => p.sku === i.sku);
    return product ? input.campaign.allowed_categories.includes(product.category) : false;
  });
  const relevancePct = inBasket.length > 0 ? 100 : allowed ? 50 : 0;
  const priorityPct = toPct(campaignItem.priority);
  const contribution = Math.max(...items.map((i) => i.contribution_cents));

  const reasons: string[] = [];
  if (known !== undefined && segment)
    reasons.push(`Afinidad conocida con ${segment.name} (${formatRatio(affinityPct)})`);
  else if (!campaignItem.segment_id && customerHasAffinities)
    reasons.push("Promoción sin segmento asociado (afinidad 0)");
  else reasons.push("Afinidad desconocida (se usa 0)");
  reasons.push(
    inBasket.length > 0
      ? `Producto en la factura: ${inBasket.map((i) => i.product_name).join(", ")}`
      : allowed
        ? `Categoría permitida: ${input.campaign.allowed_categories.join(", ")}`
        : "Sin relación con la factura",
  );
  reasons.push(
    `Prioridad comercial ${formatRatio(priorityPct)}${campaignItem.assumed ? " (supuesto)" : ""}`,
  );
  reasons.push("Campaña aprobada");
  reasons.push(
    `Contribución desde ${formatCents(Math.min(...items.map((i) => i.contribution_cents)))} por unidad, sobre el piso`,
  );

  return {
    promotion_id: promo.id,
    label: promo.label,
    family: promo.family,
    score: computeScore(input.campaign.objective, affinityPct, relevancePct, priorityPct),
    affinity_pct: affinityPct,
    relevance_pct: relevancePct,
    priority_pct: priorityPct,
    contribution_cents: contribution,
    items,
    reasons,
  };
}

/** Mayor score, luego mayor contribución, luego menor ID. Regla fija y visible. */
export const compareRanked = (a: Ranked, b: Ranked) =>
  b.score - a.score ||
  b.contribution_cents - a.contribution_cents ||
  (a.promotion_id < b.promotion_id ? -1 : a.promotion_id > b.promotion_id ? 1 : 0);

export function decide(input: EngineInput): Decision {
  // 1. Candidatos = recomendaciones existentes ∩ promociones disponibles
  //    (una promoción es candidata si cubre al menos un producto recomendado).
  const candidates = input.promotions.filter((p) =>
    p.items.some((i) => input.recommended_skus.includes(i.sku)),
  );

  // 2. Filtros duros antes del ranking.
  const discarded: Discard[] = [];
  const valid: Ranked[] = [];
  for (const promo of candidates) {
    const discard = hardFilter(input, promo);
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
  if (!promo) {
    return {
      promotion_id: promotionId,
      label: "?",
      code: "promotion_not_in_campaign",
      reason: "Promoción no encontrada",
    };
  }
  return hardFilter(input, promo);
}
