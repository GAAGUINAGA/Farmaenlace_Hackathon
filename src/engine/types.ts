// Tipos del dominio. Dinero siempre en centavos enteros; señales y pesos en porcentaje entero (0–100).

export type Objective = "ganar_participacion" | "consolidar_liderazgo";
export type PromotionStatus = "approved" | "not_approved" | "expired";
export type CampaignStatus = "approved" | "not_approved";

export type Segment = { id: string; name: string };
/** Familia de la demo: orienta cada producto a uno de los tres casos de demostración. */
export type Family = "wellness" | "practicos" | "membresia";
export type Product = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  family: Family;
  price_cents: number;
  cost_cents: number;
};
export type Customer = {
  id: string;
  /** Cédula FICTICIA de demostración (nunca una cédula real). No se usa como clave interna. */
  cedula: string;
  name: string;
  /** Familia de productos que la demo exige agregar para este caso. */
  required_family: Family;
  /** Afinidad por segmento (0–1). Vacío = afinidad desconocida. */
  affinities: Record<string, number>;
  affinity_source: string;
  affinity_date: string;
  membership_active: boolean;
};
export type PromotionItem = { sku: string; promo_price_cents: number };
export type Promotion = {
  id: string;
  label: string;
  family: Family;
  /** Productos cubiertos y su precio promocional (el precio final ya incluye el descuento). */
  items: PromotionItem[];
  status: PromotionStatus;
  valid_from: string;
  valid_until: string;
  requires_membership: boolean;
};
export type CampaignItem = {
  promotion_id: string;
  /** Segmento objetivo; null = sin segmento asociado. */
  segment_id: string | null;
  /** Prioridad comercial (0–1). */
  priority: number;
  /** Marca los valores que son supuestos del equipo y no datos de la ficha. */
  assumed?: boolean;
};
export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  valid_until: string;
  version: number;
  objective: Objective;
  allowed_categories: string[];
  items: CampaignItem[];
  message: string;
};
export type ExistingRecommendation = {
  customer_id: string;
  skus: string[];
  source: string;
  date: string;
};
export type BasketLine = { sku: string; quantity: number };

export type EngineInput = {
  customer: Customer;
  basket: BasketLine[];
  campaign: Campaign;
  segments: Segment[];
  products: Product[];
  promotions: Promotion[];
  /** SKUs recomendados por el motor transaccional existente. */
  recommended_skus: string[];
  stock: Record<string, number>;
  floor_cents: number;
  /** Fecha/hora ISO de evaluación (inyectada; el motor no lee el reloj). */
  now: string;
};

export type DiscardCode =
  | "campaign_not_approved"
  | "campaign_expired"
  | "promotion_not_in_campaign"
  | "promotion_not_approved"
  | "promotion_expired"
  | "out_of_stock"
  | "membership_required"
  | "below_floor";

export type Discard = {
  promotion_id: string;
  label: string;
  code: DiscardCode;
  reason: string;
};

export type RankedItem = {
  sku: string;
  product_name: string;
  price_before_cents: number;
  price_after_cents: number;
  contribution_cents: number;
  in_basket: boolean;
};

export type Ranked = {
  promotion_id: string;
  label: string;
  family: Family;
  score: number;
  affinity_pct: number;
  relevance_pct: number;
  priority_pct: number;
  /** Mayor contribución por unidad entre los productos aplicables (criterio de desempate). */
  contribution_cents: number;
  /** Productos donde la promoción puede aplicarse (pasan stock y piso). */
  items: RankedItem[];
  reasons: string[];
};

export type Decision = {
  decision: "offer" | "no_offer";
  objective: Objective;
  winner: Ranked | null;
  ranking: Ranked[];
  discarded: Discard[];
  message: string | null;
  no_offer_reason: string | null;
  score_type: "configured_rules";
  rules_version: string;
};

export type EventType =
  "recommended" | "presented" | "not_presented" | "accepted" | "declined" | "purchased";

export type DemoEvent = {
  event_id: string;
  recommendation_id: string;
  customer_id: string;
  campaign_id: string;
  promotion_id: string;
  type: EventType;
  at: string;
  rules_version: string;
  campaign_version: number;
  transaction_id: string | null;
};

export type RecommendationRecord = {
  recommendation_id: string;
  request_id: string;
  customer_id: string;
  store_id: string;
  campaign_id: string;
  campaign_version: number;
  basket: BasketLine[];
  basket_key: string;
  audience: string;
  created_at: string;
  superseded: boolean;
  decision: Decision;
};

export type AppliedItem = {
  sku: string;
  product_name: string;
  price_before_cents: number;
  price_after_cents: number;
  contribution_cents: number;
};

export type TransactionRecord = {
  transaction_id: string;
  recommendation_id: string | null;
  customer_id: string;
  store_id: string;
  basket: BasketLine[];
  promotion_applied: boolean;
  promotion_id: string | null;
  /** Unidades promocionadas (1 por producto cubierto presente en la factura). */
  applied: AppliedItem[];
  /** Ingreso, costo y contribución de las unidades promocionadas (el resto de la factura no se modela). */
  revenue_cents: number;
  cost_cents: number;
  contribution_cents: number;
  total_cents: number;
  reason: string | null;
  at: string;
};
