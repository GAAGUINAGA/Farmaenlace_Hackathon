// Datos FICTICIOS para la demo. No representan políticas reales de Farmaenlace.
import type {
  BasketLine,
  Campaign,
  Customer,
  ExistingRecommendation,
  Product,
  Promotion,
  Segment,
} from "@/engine/types";

export const STORE = { id: "s-01", name: "Local ficticio 01" };
/** Piso de contribución por unidad: supuesto visible de la demo (US$1). */
export const FLOOR_CENTS = 100;
export const INITIAL_STOCK = 10;

export const SEGMENTS: Segment[] = [
  { id: "seg-wellness", name: "Wellness" },
  { id: "seg-practicos", name: "Prácticos" },
];

export const PRODUCTS: Product[] = [
  {
    sku: "sku-crema",
    name: "Crema corporal",
    category: "cuidado personal",
    price_cents: 1200,
    cost_cents: 800,
  },
  {
    sku: "sku-champu",
    name: "Champú",
    category: "cuidado personal",
    price_cents: 1000,
    cost_cents: 600,
  },
  {
    sku: "sku-jabon",
    name: "Jabón",
    category: "cuidado personal",
    price_cents: 600,
    cost_cents: 300,
  },
];

export const CUSTOMERS: Customer[] = [
  {
    id: "c-rosa",
    name: "Rosa",
    affinities: { "seg-wellness": 0.8, "seg-practicos": 0.2 },
    affinity_source: "Precargado (ficticio)",
    affinity_date: "2026-10-01",
    membership_active: false,
  },
  {
    id: "c-luis",
    name: "Luis",
    affinities: { "seg-wellness": 0.2, "seg-practicos": 0.8 },
    affinity_source: "Precargado (ficticio)",
    affinity_date: "2026-10-01",
    membership_active: false,
  },
  {
    id: "c-ana",
    name: "Ana",
    affinities: {},
    affinity_source: "Sin afinidad conocida",
    affinity_date: "—",
    membership_active: true,
  },
];

export const PROMOTIONS: Promotion[] = [
  {
    id: "promo-A",
    label: "A",
    sku: "sku-crema",
    promo_price_cents: 1000,
    status: "approved",
    valid_from: "2026-01-01",
    valid_until: "2027-12-31",
    requires_membership: false,
  },
  {
    id: "promo-B",
    label: "B",
    sku: "sku-champu",
    promo_price_cents: 900,
    status: "approved",
    valid_from: "2026-01-01",
    valid_until: "2027-12-31",
    requires_membership: false,
  },
  {
    id: "promo-C",
    label: "C",
    sku: "sku-jabon",
    promo_price_cents: 500,
    status: "approved",
    valid_from: "2026-01-01",
    valid_until: "2027-12-31",
    requires_membership: true,
  },
];

export const CAMPAIGN: Campaign = {
  id: "camp-01",
  name: "Campaña cuidado personal (ficticia)",
  status: "approved",
  valid_until: "2027-12-31",
  version: 1,
  objective: "ganar_participacion",
  allowed_categories: ["cuidado personal"],
  items: [
    { promotion_id: "promo-A", segment_id: "seg-wellness", priority: 0.8 },
    { promotion_id: "promo-B", segment_id: "seg-practicos", priority: 0.8 },
    // Supuesto visible: C no tiene segmento asociado y su prioridad es 0,6.
    { promotion_id: "promo-C", segment_id: null, priority: 0.6, assumed: true },
  ],
  message: "Puede utilizar el beneficio de esta campaña en este producto.",
};

export const EXISTING_RECOMMENDATIONS: ExistingRecommendation[] = [
  {
    customer_id: "c-rosa",
    skus: ["sku-crema", "sku-champu"],
    source: "Motor transaccional (simulado)",
    date: "2026-10-07",
  },
  {
    customer_id: "c-luis",
    skus: ["sku-crema", "sku-champu"],
    source: "Motor transaccional (simulado)",
    date: "2026-10-07",
  },
  {
    customer_id: "c-ana",
    skus: ["sku-crema", "sku-champu", "sku-jabon"],
    source: "Motor transaccional (simulado)",
    date: "2026-10-07",
  },
];

export const INITIAL_BASKET: BasketLine[] = [{ sku: "sku-crema", quantity: 1 }];
