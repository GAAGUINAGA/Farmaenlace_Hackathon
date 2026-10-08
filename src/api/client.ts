import {
  CAMPAIGN,
  CUSTOMERS,
  EXISTING_RECOMMENDATIONS,
  FLOOR_CENTS,
  INITIAL_BASKET,
  INITIAL_STOCK,
  PRODUCTS,
  PROMOTIONS,
  SEGMENTS,
  STORE,
} from "@/data/seed";
import {
  aggregateResults,
  audienceOf,
  basketKey,
  decide,
  revalidate,
  type BasketLine,
  type Campaign,
  type Decision,
  type DemoEvent,
  type EngineInput,
  type EventType,
  type Promotion,
  type RecommendationRecord,
  type TransactionRecord,
} from "@/engine";
import { createBrowserStorage, type StorageLike } from "./storage";
import {
  ApiError,
  type ConfigUpdate,
  type ConfirmTransactionRequest,
  type ConfirmTransactionResponse,
  type DemoConfig,
  type DemoData,
  type RecommendRequest,
  type RecommendResponse,
  type RecommendationStatus,
  type RegisterEventRequest,
  type RegisterEventResponse,
  type ResultsResponse,
} from "./types";

const STORAGE_KEY = "farmapos:v1";

type DbState = {
  version: 1;
  config: DemoConfig;
  stock: Record<string, number>;
  failure_mode: boolean;
  seq: number;
  recommendations: RecommendationRecord[];
  events: DemoEvent[];
  transactions: TransactionRecord[];
};

export type ApiOptions = {
  storage?: StorageLike;
  /** Retardo simulado por llamada. Por defecto 200–400 ms; en pruebas se inyecta uno nulo. */
  delay?: () => Promise<void>;
  now?: () => Date;
};

const randomDelay = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 200 + Math.floor(Math.random() * 201)));

function freshState(): DbState {
  return {
    version: 1,
    config: {
      objective: CAMPAIGN.objective,
      priorities: Object.fromEntries(CAMPAIGN.items.map((i) => [i.promotion_id, i.priority])),
      promo_status: Object.fromEntries(PROMOTIONS.map((p) => [p.id, p.status])),
      campaign_version: CAMPAIGN.version,
    },
    stock: Object.fromEntries(PRODUCTS.map((p) => [p.sku, INITIAL_STOCK])),
    failure_mode: false,
    seq: 0,
    recommendations: [],
    events: [],
    transactions: [],
  };
}

/** Campaña y promociones con la configuración de Comercial aplicada. */
function effective(state: DbState): { campaign: Campaign; promotions: Promotion[] } {
  const campaign: Campaign = {
    ...CAMPAIGN,
    version: state.config.campaign_version,
    objective: state.config.objective,
    items: CAMPAIGN.items.map((i) => ({
      ...i,
      priority: state.config.priorities[i.promotion_id] ?? i.priority,
    })),
  };
  const promotions = PROMOTIONS.map((p) => ({
    ...p,
    status: state.config.promo_status[p.id] ?? p.status,
  }));
  return { campaign, promotions };
}

function engineInput(
  state: DbState,
  customerId: string,
  basket: BasketLine[],
  now: Date,
): EngineInput {
  const customer = CUSTOMERS.find((c) => c.id === customerId);
  if (!customer) throw new ApiError("NOT_FOUND", `Cliente desconocido: ${customerId}`);
  const { campaign, promotions } = effective(state);
  const rec = EXISTING_RECOMMENDATIONS.find((r) => r.customer_id === customerId);
  return {
    customer,
    basket,
    campaign,
    segments: SEGMENTS,
    products: PRODUCTS,
    promotions,
    recommended_skus: rec?.skus ?? [],
    stock: state.stock,
    floor_cents: FLOOR_CENTS,
    now: now.toISOString(),
  };
}

function cleanBasket(basket: BasketLine[]): BasketLine[] {
  const merged = new Map<string, number>();
  for (const line of basket) {
    if (!PRODUCTS.some((p) => p.sku === line.sku)) continue;
    const qty = Math.floor(line.quantity);
    if (qty > 0) merged.set(line.sku, (merged.get(line.sku) ?? 0) + qty);
  }
  return [...merged].map(([sku, quantity]) => ({ sku, quantity }));
}

function toResponse(rec: RecommendationRecord): RecommendResponse {
  const d: Decision = rec.decision;
  const w = d.winner;
  return {
    recommendation_id: rec.recommendation_id,
    request_id: rec.request_id,
    decision: d.decision,
    campaign_id: rec.campaign_id,
    promotion_id: w?.promotion_id ?? null,
    sku: w?.sku ?? null,
    score: w?.score ?? null,
    score_type: d.score_type,
    reasons: w ? w.reasons : d.no_offer_reason ? [d.no_offer_reason] : [],
    message: d.message,
    price_before_cents: w?.price_before_cents ?? null,
    price_after_cents: w?.price_after_cents ?? null,
    contribution_cents: w?.contribution_cents ?? null,
    rules_version: d.rules_version,
    campaign_version: rec.campaign_version,
    objective: d.objective,
    promotion_label: w?.label ?? null,
    product_name: w?.product_name ?? null,
    ranking: d.ranking,
    discarded: d.discarded,
    no_offer_reason: d.no_offer_reason,
    created_at: rec.created_at,
  };
}

function statusOf(state: DbState, rec: RecommendationRecord): RecommendationStatus {
  const types = new Set(
    state.events.filter((e) => e.recommendation_id === rec.recommendation_id).map((e) => e.type),
  );
  return {
    presented: types.has("presented"),
    not_presented: types.has("not_presented"),
    response: types.has("accepted") ? "accepted" : types.has("declined") ? "declined" : null,
    purchased: types.has("purchased"),
    superseded: rec.superseded,
  };
}

/**
 * API simulada del MVP (contrato de la sección 7). Corre en el navegador: cada llamada espera
 * un retardo simulado y lee/escribe el estado completo en el almacenamiento local.
 */
export function createApi(options: ApiOptions = {}) {
  const browser = options.storage ? null : createBrowserStorage();
  const storage = options.storage ?? browser!.storage;
  const persistent = options.storage ? true : browser!.persistent;
  const delay = options.delay ?? randomDelay;
  const clock = options.now ?? (() => new Date());

  function load(): DbState {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DbState;
        if (parsed.version === 1) return parsed;
      }
    } catch {
      // estado corrupto: se reinicia
    }
    return freshState();
  }
  const save = (state: DbState) => storage.setItem(STORAGE_KEY, JSON.stringify(state));

  function mutate<T>(fn: (state: DbState, now: Date) => T): T {
    const state = load();
    const result = fn(state, clock());
    save(state);
    return result;
  }

  function buildDemoData(): DemoData {
    const state = load();
    const { campaign, promotions } = effective(state);
    return {
      store: STORE,
      floor_cents: FLOOR_CENTS,
      customers: CUSTOMERS,
      products: PRODUCTS,
      segments: SEGMENTS,
      promotions,
      campaign,
      existing_recommendations: EXISTING_RECOMMENDATIONS,
      initial_basket: INITIAL_BASKET,
      stock: state.stock,
      config: state.config,
      failure_mode: state.failure_mode,
      persistent,
      events: state.events,
    };
  }

  return {
    persistent,

    /** GET /api/demo-data */
    async getDemoData(): Promise<DemoData> {
      await delay();
      return buildDemoData();
    },

    /** Relectura inmediata del estado local (sin retardo) para refrescar la UI tras una operación. */
    async syncState(): Promise<DemoData> {
      return buildDemoData();
    },

    /** POST /api/recommendations */
    async recommend(req: RecommendRequest): Promise<RecommendResponse> {
      await delay();
      return mutate((state, now) => {
        if (state.failure_mode) {
          throw new ApiError(
            "ENGINE_FAILURE",
            "No se pudo evaluar las promociones. Continúe con la compra normal.",
          );
        }
        const repeated = state.recommendations.find((r) => r.request_id === req.request_id);
        if (repeated) return toResponse(repeated);
        if (req.campaign_id !== CAMPAIGN.id)
          throw new ApiError("NOT_FOUND", `Campaña desconocida: ${req.campaign_id}`);

        const basket = cleanBasket(req.basket);
        const input = engineInput(state, req.customer_id, basket, now);
        const customer = input.customer;
        const decision = decide(input);

        // Una canasta/cliente/configuración nueva genera una decisión nueva: las vigentes del
        // local quedan reemplazadas (salvo las ya compradas).
        const purchased = new Set(
          state.events.filter((e) => e.type === "purchased").map((e) => e.recommendation_id),
        );
        for (const r of state.recommendations) {
          if (r.store_id === req.store_id && !purchased.has(r.recommendation_id))
            r.superseded = true;
        }

        state.seq += 1;
        const record: RecommendationRecord = {
          recommendation_id: `rec-${String(state.seq).padStart(2, "0")}`,
          request_id: req.request_id,
          customer_id: req.customer_id,
          store_id: req.store_id,
          campaign_id: req.campaign_id,
          campaign_version: state.config.campaign_version,
          basket,
          basket_key: basketKey(basket),
          audience: audienceOf(customer),
          created_at: now.toISOString(),
          superseded: false,
          decision,
        };
        state.recommendations.push(record);
        if (decision.winner) {
          state.events.push({
            event_id: `evt-${record.recommendation_id}-recommended`,
            recommendation_id: record.recommendation_id,
            customer_id: record.customer_id,
            campaign_id: record.campaign_id,
            promotion_id: decision.winner.promotion_id,
            type: "recommended",
            at: now.toISOString(),
            rules_version: decision.rules_version,
            campaign_version: record.campaign_version,
            transaction_id: null,
          });
        }
        return toResponse(record);
      });
    },

    /** POST /api/events */
    async registerEvent(req: RegisterEventRequest): Promise<RegisterEventResponse> {
      await delay();
      return mutate((state, now) => {
        const rec = state.recommendations.find(
          (r) => r.recommendation_id === req.recommendation_id,
        );
        const existing = state.events.find((e) => e.event_id === req.event_id);
        if (existing) {
          return {
            event: existing,
            deduplicated: true,
            status: rec ? statusOf(state, rec) : emptyStatus(),
          };
        }
        if (!rec || !rec.decision.winner)
          throw new ApiError("NOT_FOUND", "Recomendación inexistente o sin oferta.");
        const status = statusOf(state, rec);
        if (status.purchased)
          throw new ApiError("INVALID_TRANSITION", "La recomendación ya terminó en una compra.");
        if (rec.superseded)
          throw new ApiError(
            "STALE_RECOMMENDATION",
            "La recomendación fue reemplazada por una nueva decisión.",
          );
        if (req.type === "presented" || req.type === "not_presented") {
          if (status.presented || status.not_presented)
            throw new ApiError(
              "INVALID_TRANSITION",
              "La recomendación ya fue presentada u omitida.",
            );
        } else {
          if (!status.presented)
            throw new ApiError("INVALID_TRANSITION", "Primero debe presentarse la acción.");
          if (status.response)
            throw new ApiError("INVALID_TRANSITION", "La recomendación ya tiene una respuesta.");
        }
        const event: DemoEvent = {
          event_id: req.event_id,
          recommendation_id: rec.recommendation_id,
          customer_id: rec.customer_id,
          campaign_id: rec.campaign_id,
          promotion_id: rec.decision.winner.promotion_id,
          type: req.type as EventType,
          at: now.toISOString(),
          rules_version: rec.decision.rules_version,
          campaign_version: rec.campaign_version,
          transaction_id: null,
        };
        state.events.push(event);
        return { event, deduplicated: false, status: statusOf(state, rec) };
      });
    },

    /** POST /api/transactions */
    async confirmTransaction(req: ConfirmTransactionRequest): Promise<ConfirmTransactionResponse> {
      await delay();
      return mutate((state, now) => {
        const repeated = state.transactions.find((t) => t.transaction_id === req.transaction_id);
        if (repeated) {
          return {
            transaction: repeated,
            deduplicated: true,
            promotion_applied: repeated.promotion_applied,
            reason: repeated.reason,
            stock: state.stock,
            event: null,
          };
        }
        const basket = cleanBasket(req.basket);
        let reason: string | null = null;
        let rec: RecommendationRecord | undefined;

        if (req.recommendation_id) {
          rec = state.recommendations.find((r) => r.recommendation_id === req.recommendation_id);
          const winner = rec?.decision.winner ?? null;
          if (!rec || !winner) reason = "No hay una oferta vigente para aplicar.";
          else {
            const status = statusOf(state, rec);
            if (rec.superseded)
              reason = "La recomendación fue reemplazada: se requiere una nueva decisión.";
            else if (rec.customer_id !== req.customer_id)
              reason = "La recomendación corresponde a otro cliente.";
            else if (rec.basket_key !== basketKey(basket))
              reason = "La canasta cambió: se requiere una nueva decisión.";
            else if (rec.campaign_version !== state.config.campaign_version)
              reason = "La configuración de la campaña cambió: se requiere una nueva decisión.";
            else if (status.purchased)
              reason = "La recomendación ya se aplicó en otra transacción.";
            else if (!status.presented) reason = "La acción no fue presentada al cliente.";
            else if (status.response === "declined") reason = "El cliente rechazó la acción.";
            else {
              // Revalidar antes de aplicar (CU2): vigencia, aprobación, stock, membresía, piso.
              const discard = revalidate(
                engineInput(state, req.customer_id, basket, now),
                winner.promotion_id,
              );
              if (discard) reason = `Condición no vigente: ${discard.reason}.`;
            }
          }
        }

        const winner = !reason && rec ? rec.decision.winner : null;
        const subtotal = basket.reduce(
          (sum, l) => sum + l.quantity * (PRODUCTS.find((p) => p.sku === l.sku)?.price_cents ?? 0),
          0,
        );
        const inBasket = winner ? basket.some((l) => l.sku === winner.sku) : false;
        const transaction: TransactionRecord = {
          transaction_id: req.transaction_id,
          recommendation_id: winner && rec ? rec.recommendation_id : null,
          customer_id: req.customer_id,
          store_id: req.store_id,
          basket,
          promotion_applied: winner !== null,
          promotion_id: winner?.promotion_id ?? null,
          sku: winner?.sku ?? null,
          revenue_cents: winner?.price_after_cents ?? 0,
          cost_cents: winner ? winner.price_after_cents - winner.contribution_cents : 0,
          contribution_cents: winner?.contribution_cents ?? 0,
          total_cents: winner
            ? subtotal +
              (inBasket
                ? winner.price_after_cents - winner.price_before_cents
                : winner.price_after_cents)
            : subtotal,
          added_unit: winner !== null && !inBasket,
          reason,
          at: now.toISOString(),
        };
        state.transactions.push(transaction);

        // Stock: se descuentan las líneas de la canasta (+1 si se agregó la unidad promocionada).
        for (const l of basket) {
          state.stock[l.sku] = Math.max(0, (state.stock[l.sku] ?? 0) - l.quantity);
        }
        if (transaction.added_unit && winner) {
          state.stock[winner.sku] = Math.max(0, (state.stock[winner.sku] ?? 0) - 1);
        }

        let event: DemoEvent | null = null;
        if (winner && rec) {
          event = {
            event_id: `evt-${req.transaction_id}-purchased`,
            recommendation_id: rec.recommendation_id,
            customer_id: rec.customer_id,
            campaign_id: rec.campaign_id,
            promotion_id: winner.promotion_id,
            type: "purchased",
            at: now.toISOString(),
            rules_version: rec.decision.rules_version,
            campaign_version: rec.campaign_version,
            transaction_id: req.transaction_id,
          };
          state.events.push(event);
        }
        return {
          transaction,
          deduplicated: false,
          promotion_applied: winner !== null,
          reason,
          stock: state.stock,
          event,
        };
      });
    },

    /** GET /api/results */
    async getResults(): Promise<ResultsResponse> {
      await delay();
      const state = load();
      const { campaign } = effective(state);
      const rows = aggregateResults({
        campaign,
        segments: SEGMENTS,
        recommendations: state.recommendations,
        events: state.events,
        transactions: state.transactions,
      });
      const notices = [
        "Datos ficticios generados en este navegador. Los resultados son observacionales y no demuestran evidencia causal ni incremento de ventas.",
        "Los conteos son oportunidades de interacción, no compradores únicos.",
        "Las recomendaciones reemplazadas por un cambio de canasta, cliente o configuración antes de presentarse no cuentan como oportunidad.",
        "La contribución es simulada: corresponde a la unidad promocionada (precio promocional menos costo) y no equivale a beneficio incremental.",
      ];
      if (!persistent)
        notices.push(
          "Este navegador no ofrece almacenamiento local: los datos se pierden al recargar.",
        );
      return {
        generated_at: clock().toISOString(),
        rows,
        events: [...state.events].reverse(),
        transactions: [...state.transactions].reverse(),
        notices,
        persistent,
      };
    },

    // --- Administración de la demo (fuera del contrato de la sección 7) ---

    async updateConfig(update: ConfigUpdate): Promise<DemoConfig> {
      return mutate((state) => {
        if (update.objective) state.config.objective = update.objective;
        if (update.priorities) {
          for (const [id, v] of Object.entries(update.priorities)) {
            state.config.priorities[id] = Math.min(1, Math.max(0, v));
          }
        }
        if (update.promo_status) Object.assign(state.config.promo_status, update.promo_status);
        state.config.campaign_version += 1;
        return state.config;
      });
    },

    async setStock(sku: string, quantity: number): Promise<Record<string, number>> {
      return mutate((state) => {
        if (!PRODUCTS.some((p) => p.sku === sku))
          throw new ApiError("NOT_FOUND", "SKU desconocido");
        state.stock[sku] = Math.max(0, Math.floor(quantity));
        return state.stock;
      });
    },

    async setFailureMode(on: boolean): Promise<boolean> {
      return mutate((state) => {
        state.failure_mode = on;
        return on;
      });
    },

    async resetDemo(): Promise<void> {
      save(freshState());
    },
  };
}

function emptyStatus(): RecommendationStatus {
  return {
    presented: false,
    not_presented: false,
    response: null,
    purchased: false,
    superseded: false,
  };
}

export type Api = ReturnType<typeof createApi>;
