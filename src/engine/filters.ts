import { formatCents } from "./format";
import type { Discard, DiscardCode, EngineInput, Product, Promotion, PromotionItem } from "./types";

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

export const contributionCents = (item: PromotionItem, product: Product) =>
  item.promo_price_cents - product.cost_cents;

/** Condiciones de la campaña y de la promoción (no dependen del producto). */
function promotionLevelCode(input: EngineInput, promo: Promotion): DiscardCode | null {
  const day = input.now.slice(0, 10);
  if (input.campaign.status !== "approved") return "campaign_not_approved";
  if (day > input.campaign.valid_until) return "campaign_expired";
  if (!input.campaign.items.some((i) => i.promotion_id === promo.id))
    return "promotion_not_in_campaign";
  if (promo.status === "not_approved") return "promotion_not_approved";
  if (promo.status === "expired" || day > promo.valid_until || day < promo.valid_from)
    return "promotion_expired";
  if (promo.requires_membership && !input.customer.membership_active) return "membership_required";
  return null;
}

/** Condiciones de cada producto de la promoción: stock y piso de contribución. */
function itemCode(input: EngineInput, item: PromotionItem): DiscardCode | null {
  const product = input.products.find((p) => p.sku === item.sku);
  if (!product) return "promotion_not_in_campaign";
  if ((input.stock[item.sku] ?? 0) < 1) return "out_of_stock";
  if (contributionCents(item, product) < input.floor_cents) return "below_floor";
  return null;
}

/** Productos de la promoción donde puede aplicarse hoy (stock y piso de contribución). */
export function applicableItems(input: EngineInput, promo: Promotion): PromotionItem[] {
  if (promotionLevelCode(input, promo)) return [];
  return promo.items.filter((item) => itemCode(input, item) === null);
}

/**
 * Filtros duros: se evalúan antes de cualquier ranking. Devuelve el primer motivo de descarte
 * o null si la promoción es elegible en al menos un producto. Ningún score supera un filtro fallido.
 */
export function hardFilter(input: EngineInput, promo: Promotion): Discard | null {
  let code = promotionLevelCode(input, promo);
  let detail = "";
  if (!code) {
    const failures = promo.items.map((item) => ({ item, code: itemCode(input, item) }));
    if (failures.every((f) => f.code !== null)) {
      const allOut = failures.every((f) => f.code === "out_of_stock");
      const first = failures.find((f) => f.code !== "out_of_stock") ?? failures[0]!;
      code = allOut ? "out_of_stock" : first.code;
      if (code === "below_floor") {
        const product = input.products.find((p) => p.sku === first.item.sku);
        if (product)
          detail = ` (${formatCents(contributionCents(first.item, product))} por unidad < piso ${formatCents(input.floor_cents)})`;
      } else if (allOut) {
        detail = " en todos los productos de la promoción";
      }
    }
  }
  if (!code) return null;
  return { promotion_id: promo.id, label: promo.label, code, reason: REASONS[code] + detail };
}
