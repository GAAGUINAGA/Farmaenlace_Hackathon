import { formatCents } from "./format";
import type { Discard, DiscardCode, EngineInput, Product, Promotion } from "./types";

const REASONS: Record<DiscardCode, string> = {
  campaign_not_approved: "Campaña no aprobada",
  campaign_expired: "Campaña vencida",
  promotion_not_in_campaign: "Promoción no asociada a la campaña",
  promotion_not_approved: "Promoción no aprobada",
  promotion_expired: "Promoción vencida",
  out_of_stock: "Sin stock",
  membership_required: "Requiere membresía activa",
  below_floor: "Contribución bajo el piso aprobado",
};

export const contributionCents = (promo: Promotion, product: Product) =>
  promo.promo_price_cents - product.cost_cents;

/**
 * Filtros duros: se evalúan antes de cualquier ranking. Devuelve el primer motivo de descarte
 * o null si la promoción es elegible. Ningún score puede superar un filtro fallido.
 */
export function hardFilter(input: EngineInput, promo: Promotion, product: Product): Discard | null {
  const day = input.now.slice(0, 10);
  const inCampaign = input.campaign.items.some((i) => i.promotion_id === promo.id);

  let code: DiscardCode | null = null;
  if (input.campaign.status !== "approved") code = "campaign_not_approved";
  else if (day > input.campaign.valid_until) code = "campaign_expired";
  else if (!inCampaign) code = "promotion_not_in_campaign";
  else if (promo.status === "not_approved") code = "promotion_not_approved";
  else if (promo.status === "expired" || day > promo.valid_until || day < promo.valid_from)
    code = "promotion_expired";
  else if ((input.stock[promo.sku] ?? 0) < 1) code = "out_of_stock";
  else if (promo.requires_membership && !input.customer.membership_active)
    code = "membership_required";
  else if (contributionCents(promo, product) < input.floor_cents) code = "below_floor";

  if (!code) return null;
  const detail =
    code === "below_floor"
      ? ` (${formatCents(contributionCents(promo, product))} por unidad < piso ${formatCents(input.floor_cents)})`
      : "";
  return {
    promotion_id: promo.id,
    label: promo.label,
    sku: promo.sku,
    code,
    reason: REASONS[code] + detail,
  };
}
