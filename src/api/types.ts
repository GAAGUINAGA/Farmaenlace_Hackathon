import type {
  BasketLine,
  Campaign,
  Customer,
  DemoEvent,
  Discard,
  ExistingRecommendation,
  Family,
  Objective,
  Product,
  Promotion,
  PromotionStatus,
  Ranked,
  RankedItem,
  ResultRow,
  Verdict,
  Segment,
  TransactionRecord,
} from "@/engine";

export type {
  BasketLine,
  Campaign,
  Customer,
  Discard,
  Objective,
  Product,
  Promotion,
  PromotionStatus,
};
export type {
  Ranked,
  RankedItem,
  ResultRow,
  Segment,
  TransactionRecord,
  ExistingRecommendation,
  Family,
  Verdict,
};
export type { AppliedItem } from "@/engine";
export type { DemoEvent };

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

/** Contrato de la sección 7. */
export type RecommendRequest = {
  request_id: string;
  customer_id: string;
  store_id: string;
  campaign_id: string;
  basket: BasketLine[];
};

export type RecommendResponse = {
  recommendation_id: string;
  request_id: string;
  decision: "offer" | "no_offer";
  campaign_id: string;
  promotion_id: string | null;
  sku: string | null;
  score: number | null;
  score_type: "configured_rules";
  reasons: string[];
  message: string | null;
  price_before_cents: number | null;
  price_after_cents: number | null;
  contribution_cents: number | null;
  rules_version: string;
  /** Productos donde se aplica la promoción (con precio antes y después). */
  items: RankedItem[];
  family: Family | null;
  // Extensiones del MVP (no están en el contrato mínimo).
  campaign_version: number;
  objective: Objective;
  promotion_label: string | null;
  product_name: string | null;
  ranking: Ranked[];
  discarded: Discard[];
  no_offer_reason: string | null;
  created_at: string;
};

export type ResponseEventType = "presented" | "not_presented" | "accepted" | "declined";

export type RegisterEventRequest = {
  event_id: string;
  recommendation_id: string;
  type: ResponseEventType;
};

export type RecommendationStatus = {
  presented: boolean;
  not_presented: boolean;
  response: "accepted" | "declined" | null;
  purchased: boolean;
  superseded: boolean;
};

export type RegisterEventResponse = {
  event: DemoEvent;
  deduplicated: boolean;
  status: RecommendationStatus;
};

export type ConfirmTransactionRequest = {
  transaction_id: string;
  customer_id: string;
  store_id: string;
  basket: BasketLine[];
  recommendation_id: string | null;
};

export type ConfirmTransactionResponse = {
  transaction: TransactionRecord;
  deduplicated: boolean;
  promotion_applied: boolean;
  reason: string | null;
  stock: Record<string, number>;
  event: DemoEvent | null;
};

export type DemoConfig = {
  objective: Objective;
  priorities: Record<string, number>;
  promo_status: Record<string, PromotionStatus>;
  campaign_version: number;
};

export type DemoData = {
  store: { id: string; name: string };
  floor_cents: number;
  customers: Customer[];
  products: Product[];
  segments: Segment[];
  promotions: Promotion[];
  campaign: Campaign;
  existing_recommendations: ExistingRecommendation[];
  initial_basket: BasketLine[];
  stock: Record<string, number>;
  config: DemoConfig;
  failure_mode: boolean;
  /** false = el navegador no ofrece localStorage y los datos viven solo en memoria. */
  persistent: boolean;
  events: DemoEvent[];
};

export type ResultsResponse = {
  generated_at: string;
  rows: ResultRow[];
  overall: Verdict;
  events: DemoEvent[];
  transactions: TransactionRecord[];
  notices: string[];
  persistent: boolean;
};

export type ConfigUpdate = {
  objective?: Objective;
  priorities?: Record<string, number>;
  promo_status?: Record<string, PromotionStatus>;
};
