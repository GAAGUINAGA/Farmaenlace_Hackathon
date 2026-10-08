import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  api,
  ApiError,
  type BasketLine,
  type ConfirmTransactionResponse,
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
const basketSignature = (basket: BasketLine[]) =>
  basket
    .filter((l) => l.quantity > 0)
    .map((l) => `${l.sku}:${l.quantity}`)
    .join("|");

const messageOf = (e: unknown) =>
  e instanceof ApiError ? e.message : "Ocurrió un error inesperado. Intente de nuevo.";

/** Estado y acciones del POS. Todo el acceso a datos pasa por `@/api`. */
export function usePosDemo() {
  const [data, setData] = useState<DemoData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("c-rosa");
  const [basket, setBasket] = useState<BasketLine[]>([]);
  const [card, setCard] = useState<CardState>({ status: "idle" });
  const [status, setStatus] = useState<RecommendationStatus>(initialStatus);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<ConfirmTransactionResponse | null>(null);
  const [nonce, setNonce] = useState(0);
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
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setBasket(d.initial_basket);
      })
      .catch(() => !cancelled && setLoadError("No se pudieron cargar los datos de la demo."));
    return () => {
      cancelled = true;
    };
  }, []);

  // Una canasta, cliente o configuración nueva genera una nueva decisión.
  const signature = data
    ? [
        customerId,
        basketSignature(basket),
        JSON.stringify(data.config),
        JSON.stringify(data.stock),
        data.failure_mode,
        nonce,
      ].join("§")
    : null;

  useEffect(() => {
    const current = dataRef.current;
    if (!signature || !current || completed) return;
    let cancelled = false;
    setCard({ status: "loading" });
    setStatus(initialStatus);
    const timer = setTimeout(() => {
      api
        .recommend({
          request_id: uid("req"),
          customer_id: customerId,
          store_id: current.store.id,
          campaign_id: current.campaign.id,
          basket,
        })
        .then(async (rec) => {
          if (cancelled) return;
          setCard({ status: "ready", rec });
          setStatus(initialStatus);
          await sync();
        })
        .catch((e) => {
          if (cancelled) return;
          setCard({ status: "error", message: messageOf(e) });
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `signature` resume cliente, canasta, configuración, stock y modo fallo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, completed]);

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
        if (!current) return;
        const rec = card.status === "ready" ? card.rec : null;
        const res = await api.confirmTransaction({
          transaction_id: uid("tx"),
          customer_id: customerId,
          store_id: current.store.id,
          basket,
          recommendation_id: rec && rec.decision === "offer" ? rec.recommendation_id : null,
        });
        setCompleted(res);
        await sync();
      }),
    [basket, card, customerId, guarded, sync],
  );

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setBasket((prev) => {
      const q = Math.max(0, Math.min(9, quantity));
      const others = prev.filter((l) => l.sku !== sku);
      return q > 0 ? [...others, { sku, quantity: q }] : others;
    });
  }, []);

  const newPurchase = useCallback(() => {
    setCompleted(null);
    setBasket(dataRef.current?.initial_basket ?? []);
    setNonce((n) => n + 1);
  }, []);

  const reset = useCallback(
    () =>
      guarded(async () => {
        await api.resetDemo();
        const fresh = await sync();
        setCompleted(null);
        setCustomerId("c-rosa");
        setBasket(fresh.initial_basket);
        setNonce((n) => n + 1);
        toast.success("Demo reiniciada: datos, stock y eventos restaurados.");
      }),
    [guarded, sync],
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
      setStock: (sku: string, quantity: number) =>
        guarded(async () => {
          await api.setStock(sku, quantity);
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
    customerId,
    setCustomerId: (id: string) => {
      setCompleted(null);
      setCustomerId(id);
    },
    basket,
    setQuantity,
    card,
    status,
    busy,
    completed,
    present: () => respond("presented"),
    skip: () => respond("not_presented"),
    accept: () => respond("accepted"),
    decline: () => respond("declined"),
    confirm,
    newPurchase,
    reset,
    retry: () => setNonce((n) => n + 1),
    admin,
  };
}

export type PosDemoState = ReturnType<typeof usePosDemo>;
