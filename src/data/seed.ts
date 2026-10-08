// Datos FICTICIOS para la demo. No representan políticas reales de Farmaenlace.
// Las cédulas son números de demostración inventados; no corresponden a personas reales.
import type {
  BasketLine,
  Campaign,
  Customer,
  ExistingRecommendation,
  Family,
  Product,
  Promotion,
  Segment,
} from "@/engine/types";

export const STORE = { id: "s-01", name: "Local ficticio 01" };
/** Piso de contribución por unidad: supuesto visible de la demo (US$1). */
export const FLOOR_CENTS = 100;
export const INITIAL_STOCK = 10;

export const FAMILY_LABELS: Record<Family, string> = {
  wellness: "Wellness",
  practicos: "Prácticos",
  membresia: "Membresía",
};

export const SEGMENTS: Segment[] = [
  { id: "seg-wellness", name: "Wellness" },
  { id: "seg-practicos", name: "Prácticos" },
];

const CAT = "cuidado personal";

/** 10 productos de referencia: 4 Wellness, 4 Prácticos, 2 Membresía. */
export const PRODUCTS: Product[] = [
  {
    sku: "sku-crema",
    name: "Crema corporal",
    brand: "Vitalia",
    category: CAT,
    family: "wellness",
    price_cents: 1200,
    cost_cents: 800,
  },
  {
    sku: "sku-locion",
    name: "Loción hidratante",
    brand: "Vitalia",
    category: CAT,
    family: "wellness",
    price_cents: 900,
    cost_cents: 550,
  },
  {
    sku: "sku-balsamo",
    name: "Bálsamo labial",
    brand: "Vitalia",
    category: CAT,
    family: "wellness",
    price_cents: 450,
    cost_cents: 250,
  },
  {
    sku: "sku-mascarilla",
    name: "Mascarilla facial",
    brand: "Vitalia",
    category: CAT,
    family: "wellness",
    price_cents: 700,
    cost_cents: 400,
  },
  {
    sku: "sku-champu",
    name: "Champú",
    brand: "Practi",
    category: CAT,
    family: "practicos",
    price_cents: 1000,
    cost_cents: 600,
  },
  {
    sku: "sku-desodorante",
    name: "Desodorante roll-on",
    brand: "Practi",
    category: CAT,
    family: "practicos",
    price_cents: 650,
    cost_cents: 350,
  },
  {
    sku: "sku-pasta",
    name: "Pasta dental",
    brand: "Practi",
    category: CAT,
    family: "practicos",
    price_cents: 500,
    cost_cents: 280,
  },
  {
    sku: "sku-toallas",
    name: "Toallas húmedas",
    brand: "Practi",
    category: CAT,
    family: "practicos",
    price_cents: 400,
    cost_cents: 200,
  },
  {
    sku: "sku-jabon",
    name: "Jabón de tocador",
    brand: "Club",
    category: CAT,
    family: "membresia",
    price_cents: 600,
    cost_cents: 300,
  },
  {
    sku: "sku-gel",
    name: "Gel antibacterial",
    brand: "Club",
    category: CAT,
    family: "membresia",
    price_cents: 550,
    cost_cents: 280,
  },
];

export const CUSTOMERS: Customer[] = [
  {
    id: "c-rosa",
    cedula: "0900000001",
    name: "Rosa",
    required_family: "wellness",
    affinities: { "seg-wellness": 0.8, "seg-practicos": 0.2 },
    affinity_source: "Precargado (ficticio)",
    affinity_date: "2026-10-01",
    membership_active: false,
  },
  {
    id: "c-luis",
    cedula: "0900000002",
    name: "Luis",
    required_family: "practicos",
    affinities: { "seg-wellness": 0.2, "seg-practicos": 0.8 },
    affinity_source: "Precargado (ficticio)",
    affinity_date: "2026-10-01",
    membership_active: false,
  },
  {
    id: "c-ana",
    cedula: "0900000003",
    name: "Ana",
    required_family: "membresia",
    affinities: {},
    affinity_source: "Sin afinidad conocida",
    affinity_date: "—",
    membership_active: true,
  },
];

const VALID = { status: "approved", valid_from: "2026-01-01", valid_until: "2027-12-31" } as const;

export const PROMOTIONS: Promotion[] = [
  {
    id: "promo-A",
    label: "A",
    family: "wellness",
    ...VALID,
    requires_membership: false,
    items: [
      { sku: "sku-crema", promo_price_cents: 1000 },
      { sku: "sku-locion", promo_price_cents: 800 },
      { sku: "sku-balsamo", promo_price_cents: 400 },
      { sku: "sku-mascarilla", promo_price_cents: 600 },
    ],
  },
  {
    id: "promo-B",
    label: "B",
    family: "practicos",
    ...VALID,
    requires_membership: false,
    items: [
      { sku: "sku-champu", promo_price_cents: 900 },
      { sku: "sku-desodorante", promo_price_cents: 600 },
      { sku: "sku-pasta", promo_price_cents: 450 },
      { sku: "sku-toallas", promo_price_cents: 350 },
    ],
  },
  {
    id: "promo-C",
    label: "C",
    family: "membresia",
    ...VALID,
    requires_membership: true,
    items: [
      { sku: "sku-jabon", promo_price_cents: 500 },
      { sku: "sku-gel", promo_price_cents: 450 },
    ],
  },
];

export const CAMPAIGN: Campaign = {
  id: "camp-01",
  name: "Campaña cuidado personal (ficticia)",
  status: "approved",
  valid_until: "2027-12-31",
  version: 1,
  objective: "ganar_participacion",
  allowed_categories: [CAT],
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

export const INITIAL_BASKET: BasketLine[] = [];
