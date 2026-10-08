import { beforeEach, describe, expect, it } from "vitest";

import { ApiError, createApi, createMemoryStorage, type Api } from "./index";

const STORE = "s-01";
const CAMPAIGN = "camp-01";
const CREMA = [{ sku: "sku-crema", quantity: 1 }];
let api: Api;
let n: number;

beforeEach(() => {
  n = 0;
  api = createApi({
    storage: createMemoryStorage(),
    delay: async () => {},
    now: () => new Date("2026-10-08T12:00:00.000Z"),
  });
});

const rec = (customer: string, basket = CREMA, request_id = `req-${++n}`) =>
  api.recommend({
    request_id,
    customer_id: customer,
    store_id: STORE,
    campaign_id: CAMPAIGN,
    basket,
  });
const ev = (
  recommendation_id: string,
  type: "presented" | "not_presented" | "accepted" | "declined",
  event_id = `evt-${++n}`,
) => api.registerEvent({ event_id, recommendation_id, type });
const buy = (
  recommendation_id: string | null,
  customer = "c-rosa",
  basket = CREMA,
  transaction_id = `tx-${++n}`,
) =>
  api.confirmTransaction({
    transaction_id,
    customer_id: customer,
    store_id: STORE,
    basket,
    recommendation_id,
  });

describe("recommend", () => {
  it("devuelve el contrato de la sección 7 para Rosa", async () => {
    const r = await rec("c-rosa");
    expect(r).toMatchObject({
      decision: "offer",
      campaign_id: CAMPAIGN,
      promotion_id: "promo-A",
      sku: "sku-crema",
      score: 86,
      score_type: "configured_rules",
      price_before_cents: 1200,
      price_after_cents: 1000,
      contribution_cents: 200,
      rules_version: "v1",
    });
    expect(r.message).toBe("Puede utilizar el beneficio de esta campaña en este producto.");
  });
  it("Luis recibe B y, sin stock de B, cae a A con B descartada", async () => {
    expect((await rec("c-luis")).promotion_id).toBe("promo-B");
    await api.setStock("sku-champu", 0);
    const r = await rec("c-luis");
    expect(r.promotion_id).toBe("promo-A");
    expect(r.discarded).toEqual([expect.objectContaining({ label: "B", code: "out_of_stock" })]);
  });
  it("no_offer devuelve campos nulos y motivo", async () => {
    await api.setStock("sku-crema", 0);
    await api.setStock("sku-champu", 0);
    const r = await rec("c-rosa");
    expect(r).toMatchObject({
      decision: "no_offer",
      promotion_id: null,
      score: null,
      price_after_cents: null,
    });
    expect(r.no_offer_reason).toBeTruthy();
  });
  it("cambiar objetivo o prioridad recalcula la acción", async () => {
    await api.updateConfig({ objective: "consolidar_liderazgo" });
    expect((await rec("c-luis")).promotion_id).toBe("promo-A"); // A=70 > B=68
    await api.updateConfig({ priorities: { "promo-B": 1 } });
    expect((await rec("c-luis")).promotion_id).toBe("promo-B"); // B=71 > A=70
  });
  it("misma request_id devuelve la misma decisión", async () => {
    const a = await rec("c-rosa", CREMA, "req-x");
    const b = await rec("c-rosa", CREMA, "req-x");
    expect(b.recommendation_id).toBe(a.recommendation_id);
    expect((await api.getDemoData()).events.filter((e) => e.type === "recommended")).toHaveLength(
      1,
    );
  });
  it("modo fallo lanza ApiError y la compra normal sigue funcionando sin oferta", async () => {
    await api.setFailureMode(true);
    await expect(rec("c-rosa")).rejects.toBeInstanceOf(ApiError);
    const t = await buy(null);
    expect(t.promotion_applied).toBe(false);
    expect(t.transaction.total_cents).toBe(1200);
  });
});

describe("eventos", () => {
  it("el mismo event_id no duplica", async () => {
    const r = await rec("c-rosa");
    const a = await ev(r.recommendation_id, "presented", "evt-dup");
    const b = await ev(r.recommendation_id, "presented", "evt-dup");
    expect(a.deduplicated).toBe(false);
    expect(b.deduplicated).toBe(true);
    const presented = (await api.getDemoData()).events.filter((e) => e.type === "presented");
    expect(presented).toHaveLength(1);
  });
  it("omitir no es rechazar", async () => {
    const r = await rec("c-rosa");
    const out = await ev(r.recommendation_id, "not_presented");
    expect(out.status).toMatchObject({ not_presented: true, response: null });
    const rows = (await api.getResults()).rows.find((x) => x.audience === "seg-wellness")!;
    expect(rows).toMatchObject({ recommendations: 1, presented: 0, not_presented: 1, declined: 0 });
    await expect(ev(r.recommendation_id, "declined")).rejects.toMatchObject({
      code: "INVALID_TRANSITION",
    });
  });
  it("aceptar no es comprar", async () => {
    const r = await rec("c-rosa");
    await ev(r.recommendation_id, "presented");
    const out = await ev(r.recommendation_id, "accepted");
    expect(out.status).toMatchObject({ response: "accepted", purchased: false });
    const row = (await api.getResults()).rows.find((x) => x.audience === "seg-wellness")!;
    expect(row).toMatchObject({ accepted: 1, purchases: 0, purchase_rate: 0 });
  });
  it("responder exige haber presentado y solo una respuesta", async () => {
    const r = await rec("c-rosa");
    await expect(ev(r.recommendation_id, "accepted")).rejects.toMatchObject({
      code: "INVALID_TRANSITION",
    });
    await ev(r.recommendation_id, "presented");
    await ev(r.recommendation_id, "declined");
    await expect(ev(r.recommendation_id, "accepted")).rejects.toMatchObject({
      code: "INVALID_TRANSITION",
    });
  });
});

describe("compra", () => {
  it("presentar y confirmar aplica 1 promoción, descuenta stock y registra purchased", async () => {
    const r = await rec("c-rosa");
    await ev(r.recommendation_id, "presented");
    const t = await buy(r.recommendation_id);
    expect(t.promotion_applied).toBe(true);
    expect(t.transaction).toMatchObject({
      promotion_id: "promo-A",
      contribution_cents: 200,
      total_cents: 1000,
      added_unit: false,
    });
    expect(t.stock["sku-crema"]).toBe(9);
    const row = (await api.getResults()).rows.find((x) => x.audience === "seg-wellness")!;
    expect(row).toMatchObject({
      recommendations: 1,
      presented: 1,
      purchases: 1,
      purchase_rate: 1,
      contribution_cents: 200,
    });
  });
  it("si el producto promocionado no está en la canasta se agrega 1 unidad a precio promocional", async () => {
    const r = await rec("c-luis"); // B (champú) con crema en canasta
    await ev(r.recommendation_id, "presented");
    const t = await buy(r.recommendation_id, "c-luis");
    expect(t.transaction).toMatchObject({
      promotion_id: "promo-B",
      added_unit: true,
      total_cents: 1200 + 900,
    });
    expect(t.stock["sku-champu"]).toBe(9);
  });
  it("el mismo transaction_id no duplica compra ni descuenta stock dos veces", async () => {
    const r = await rec("c-rosa");
    await ev(r.recommendation_id, "presented");
    await buy(r.recommendation_id, "c-rosa", CREMA, "tx-dup");
    const again = await buy(r.recommendation_id, "c-rosa", CREMA, "tx-dup");
    expect(again.deduplicated).toBe(true);
    const data = await api.getDemoData();
    expect(data.events.filter((e) => e.type === "purchased")).toHaveLength(1);
    expect(data.stock["sku-crema"]).toBe(9);
    expect((await api.getResults()).transactions).toHaveLength(1);
  });
  it("sin presentar, o rechazada, la compra sigue a precio normal sin vincular", async () => {
    const a = await rec("c-rosa");
    const t1 = await buy(a.recommendation_id);
    expect(t1).toMatchObject({
      promotion_applied: false,
      reason: "La acción no fue presentada al cliente.",
    });
    expect(t1.transaction.total_cents).toBe(1200);
    const b = await rec("c-rosa");
    await ev(b.recommendation_id, "presented");
    await ev(b.recommendation_id, "declined");
    const t2 = await buy(b.recommendation_id);
    expect(t2).toMatchObject({ promotion_applied: false, reason: "El cliente rechazó la acción." });
    expect((await api.getResults()).rows.every((x) => x.purchases === 0)).toBe(true);
  });
  it("canasta modificada obliga a una nueva decisión; la anterior no se puede confirmar", async () => {
    const old = await rec("c-rosa");
    await ev(old.recommendation_id, "presented");
    const bigger = [{ sku: "sku-crema", quantity: 2 }];
    const next = await rec("c-rosa", bigger);
    expect(next.recommendation_id).not.toBe(old.recommendation_id);
    const t = await buy(old.recommendation_id, "c-rosa", bigger);
    expect(t.promotion_applied).toBe(false);
    expect(t.reason).toMatch(/reemplazada/);
    await expect(ev(old.recommendation_id, "accepted")).rejects.toMatchObject({
      code: "STALE_RECOMMENDATION",
    });
    // Confirmar con otra canasta sin recomendar de nuevo tampoco aplica.
    await ev(next.recommendation_id, "presented");
    const t2 = await buy(next.recommendation_id, "c-rosa", CREMA);
    expect(t2.reason).toMatch(/canasta cambió/);
  });
  it("revalida: stock agotado entre recomendar y comprar bloquea la promoción", async () => {
    const r = await rec("c-luis"); // B
    await ev(r.recommendation_id, "presented");
    await api.setStock("sku-champu", 0);
    const t = await buy(r.recommendation_id, "c-luis");
    expect(t.promotion_applied).toBe(false);
    expect(t.reason).toMatch(/Sin stock/);
  });
  it("revalida: promoción vencida entre recomendar y comprar bloquea la promoción", async () => {
    const r = await rec("c-rosa");
    await ev(r.recommendation_id, "presented");
    // Cambiar configuración sin recalcular: la decisión previa queda inválida.
    await api.updateConfig({ promo_status: { "promo-A": "expired" } });
    const t = await buy(r.recommendation_id);
    expect(t.promotion_applied).toBe(false);
  });
});

describe("resultados", () => {
  it("sin datos: denominadores en cero muestran null (sin observaciones)", async () => {
    const { rows } = await api.getResults();
    expect(rows.map((x) => x.audience)).toEqual(["seg-wellness", "seg-practicos", "unknown"]);
    for (const row of rows) {
      expect(row).toMatchObject({
        recommendations: 0,
        presentation_rate: null,
        purchase_rate: null,
        evidence: "sin_observaciones",
      });
    }
  });
  it("con poca evidencia propone la prueba sin elegir ganadora", async () => {
    const r = await rec("c-rosa");
    await ev(r.recommendation_id, "presented");
    const row = (await api.getResults()).rows.find((x) => x.audience === "seg-wellness")!;
    expect(row.evidence).toBe("insuficiente");
    expect(row.evidence_note).toMatch(/No se elige una ganadora/);
    expect(row.proposal).toMatch(/^Probar A frente a B en el segmento Wellness/);
    expect(row.presentation_rate).toBe(1);
  });
  it("plantilla de consolidar liderazgo compara selección habitual frente al asistente", async () => {
    await api.updateConfig({ objective: "consolidar_liderazgo" });
    const row = (await api.getResults()).rows[0]!;
    expect(row.proposal).toMatch(/selección habitual frente al asistente/);
  });
  it("recomendaciones reemplazadas sin presentar no cuentan como oportunidad", async () => {
    await rec("c-rosa");
    await rec("c-rosa", [{ sku: "sku-crema", quantity: 2 }]);
    const row = (await api.getResults()).rows.find((x) => x.audience === "seg-wellness")!;
    expect(row.recommendations).toBe(1);
  });
  it("Ana cae en la audiencia de afinidad desconocida", async () => {
    await rec("c-ana");
    const row = (await api.getResults()).rows.find((x) => x.audience === "unknown")!;
    expect(row.recommendations).toBe(1);
  });
  it("resetDemo restaura datos y stock", async () => {
    await api.setStock("sku-crema", 0);
    await rec("c-rosa");
    await api.resetDemo();
    const data = await api.getDemoData();
    expect(data.stock["sku-crema"]).toBe(10);
    expect(data.events).toHaveLength(0);
  });
});
