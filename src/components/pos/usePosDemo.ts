import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  api,
  ApiError,
  type BasketLine,
  type ConfirmTransactionResponse,
  type Customer,
  type DemoData,
  type Objective,
  type PromotionStatus,
  type RecommendResponse,
  type RecommendationStatus,
  type ResponseEventType,
} from "@/api";

export type CardState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rec: RecommendResponse };

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const initialStatus: RecommendationStatus = {
  presented: false,
  not_presented: false,
  response: null,
  purchased: false,
  superseded: false,
};
const basketKey = (basket: BasketLine[]) =>
  basket
    .filter((l) => l.quantity > 0)
    .map((l) => `${l.sku}:${l.quantity}`)
    .sort()
    .join("|");

const messageOf = (e: unknown) =>
  e instanceof ApiError ? e.message : "Ocurrió un error inesperado. Intente de nuevo.";

/**
 * Estado y acciones del POS. Flujo: cédula → factura (productos) → «Finalizar venta» →
 * ventana con la recomendación → compra. Todo el acceso a datos pasa por `@/api`.
 */
export function usePosDemo() {
  const [data, setData] = useState<DemoData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cedulaDraft, setCedulaDraft] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [basket, setBasket] = useState<BasketLine[]>([]);
  const [card, setCard] = useState<CardState>({ status: "idle" });
  const [cardKey, setCardKey] = useState("");
  const [status, setStatus] = useState<RecommendationStatus>(initialStatus);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<ConfirmTransactionResponse | null>(null);
  const dataRef = useRef<DemoData | null>(null);
  dataRef.current = data;

  const sync = useCallback(async () => {
    const next = await api.syncState();
    setData(next);
    return next;
  }, []);

  // Carga inicial.
  useEffect(() => {
    let cancelled = false;
    api
      .getDemoData()
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setLoadError("No se pudieron cargar los datos de la demo."));
    return () => {
      cancelled = true;
    };
  }, []);

  const invalidate = useCallback(() => {
    setCard({ status: "idle" });
    setStatus(initialStatus);
    setDialogOpen(false);
  }, []);

  // Si Comercial cambia la configuración, el stock o el modo de fallo, la recomendación previa
  // deja de ser válida: se calculará una nueva al finalizar la venta.
  const conditions = data ? JSON.stringify([data.config, data.stock, data.failure_mode]) : null;
  const lastConditions = useRef<string | null>(null);
  useEffect(() => {
    if (conditions === lastConditions.current) return;
    const first = lastConditions.current === null;
    lastConditions.current = conditions;
    if (!first && !completed) invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditions]);

  const guarded = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }, []);

  // ---- Cliente ----
  const lookup = useCallback(async (cedula: string) => {
    setBusy(true);
    setLookupError(null);
    try {
      const found = await api.lookupCustomer(cedula);
      setCustomer(found);
      setBasket([]);
      setCompleted(null);
      setCard({ status: "idle" });
      setStatus(initialStatus);
      setDialogOpen(false);
    } catch (e) {
      setLookupError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }, []);

  const newSale = useCallback(() => {
    setCustomer(null);
    setCedulaDraft("");
    setLookupError(null);
    setBasket([]);
    setCompleted(null);
    invalidate();
  }, [invalidate]);

  /** Atajo del recorrido: carga la cédula de demostración y busca al cliente. */
  const startCase = useCallback(
    async (cedula: string) => {
      newSale();
      setCedulaDraft(cedula);
      await lookup(cedula);
    },
    [lookup, newSale],
  );

  // ---- Factura ----
  const setQuantity = useCallback(
    (sku: string, quantity: number) => {
      setBasket((prev) => {
        const q = Math.max(0, Math.min(9, quantity));
        const others = prev.filter((l) => l.sku !== sku);
        return q > 0 ? [...others, { sku, quantity: q }] : others;
      });
      // Una factura modificada genera una nueva decisión.
      invalidate();
    },
    [invalidate],
  );

  const requiredFamilyInBasket = Boolean(
    customer &&
    data &&
    basket.some(
      (l) =>
        l.quantity > 0 &&
        data.products.find((p) => p.sku === l.sku)?.family === customer.required_family,
    ),
  );

  // ---- Recomendación y compra ----
  const finalize = useCallback(async () => {
    const current = dataRef.current;
    if (!customer || !current) return;
    setDialogOpen(true);
    const key = basketKey(basket);
    if (card.status === "ready" && cardKey === key && !completed) return;
    setBusy(true);
    setCard({ status: "loading" });
    setStatus(initialStatus);
    try {
      const rec = await api.recommend({
        request_id: uid("req"),
        customer_id: customer.id,
        store_id: current.store.id,
        campaign_id: current.campaign.id,
        basket,
      });
      setCard({ status: "ready", rec });
      setCardKey(key);
      await sync();
    } catch (e) {
      setCard({ status: "error", message: messageOf(e) });
    } finally {
      setBusy(false);
    }
  }, [basket, card, cardKey, completed, customer, sync]);

  const respond = useCallback(
    (type: ResponseEventType) =>
      guarded(async () => {
        if (card.status !== "ready") return;
        const res = await api.registerEvent({
          event_id: uid("evt"),
          recommendation_id: card.rec.recommendation_id,
          type,
        });
        setStatus(res.status);
        await sync();
      }),
    [card, guarded, sync],
  );

  const confirm = useCallback(
    () =>
      guarded(async () => {
        const current = dataRef.current;
        if (!current || !customer) return;
        const rec = card.status === "ready" ? card.rec : null;
        const res = await api.confirmTransaction({
          transaction_id: uid("tx"),
          customer_id: customer.id,
          store_id: current.store.id,
          basket,
          recommendation_id: rec && rec.decision === "offer" ? rec.recommendation_id : null,
        });
        setCompleted(res);
        await sync();
      }),
    [basket, card, customer, guarded, sync],
  );

  const reset = useCallback(
    () =>
      guarded(async () => {
        await api.resetDemo();
        await sync();
        newSale();
        toast.success("Demo reiniciada: datos, stock y eventos restaurados.");
      }),
    [guarded, newSale, sync],
  );

  const admin = useMemo(
    () => ({
      setObjective: (objective: Objective) =>
        guarded(async () => {
          await api.updateConfig({ objective });
          await sync();
        }),
      setPriority: (promotionId: string, value: number) =>
        guarded(async () => {
          await api.updateConfig({ priorities: { [promotionId]: value } });
          await sync();
        }),
      setPromoStatus: (promotionId: string, promoStatus: PromotionStatus) =>
        guarded(async () => {
          await api.updateConfig({ promo_status: { [promotionId]: promoStatus } });
          await sync();
        }),
      setStock: (skus: string[], quantity: number) =>
        guarded(async () => {
          for (const sku of skus) await api.setStock(sku, quantity);
          await sync();
        }),
      setFailure: (on: boolean) =>
        guarded(async () => {
          await api.setFailureMode(on);
          await sync();
        }),
    }),
    [guarded, sync],
  );

  return {
    data,
    loadError,
    customer,
    cedulaDraft,
    setCedulaDraft,
    lookupError,
    lookup,
    startCase,
    newSale,
    basket,
    setQuantity,
    requiredFamilyInBasket,
    card,
    status,
    dialogOpen,
    setDialogOpen,
    busy,
    completed,
    finalize,
    present: () => respond("presented"),
    skip: () => respond("not_presented"),
    accept: () => respond("accepted"),
    decline: () => respond("declined"),
    confirm,
    reset,
    admin,
  };
}

export type PosDemoState = ReturnType<typeof usePosDemo>;
