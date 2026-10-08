import { beforeEach, describe, expect, it } from "vitest";

import { ApiError, createApi, createMemoryStorage, type Api } from "./index";

const STORE = "s-01";
const CAMPAIGN = "camp-01";
const CREMA = [{ sku: "sku-crema", quantity: 1 }];
const A_SKUS = ["sku-crema", "sku-locion", "sku-balsamo", "sku-mascarilla"];
const B_SKUS = ["sku-champu", "sku-desodorante", "sku-pasta", "sku-toallas"];
const soldOut = async (skus: string[]) => {
  for (const sku of skus) await api.setStock(sku, 0);
};
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
    await soldOut(B_SKUS);
    const r = await rec("c-luis");
    expect(r.promotion_id).toBe("promo-A");
    expect(r.discarded).toEqual([expect.objectContaining({ label: "B", code: "out_of_stock" })]);
  });
  it("no_offer devuelve campos nulos y motivo", async () => {
    await soldOut([...A_SKUS, ...B_SKUS]);
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
    });
    expect(t.transaction.applied).toEqual([
      expect.objectContaining({
        sku: "sku-crema",
        price_before_cents: 1200,
        price_after_cents: 1000,
      }),
    ]);
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
  it("la promoción aplica 1 unidad por cada producto cubierto presente en la factura", async () => {
    const basket = [
      { sku: "sku-desodorante", quantity: 2 },
      { sku: "sku-pasta", quantity: 1 },
    ];
    const r = await rec("c-luis", basket);
    expect(r.promotion_id).toBe("promo-B");
    await ev(r.recommendation_id, "presented");
    const t = await buy(r.recommendation_id, "c-luis", basket);
    // Regular: 2×650 + 500 = 1800. Descuento de 1 unidad por producto: 50 + 50.
    expect(t.transaction.total_cents).toBe(1800 - 100);
    expect(t.transaction.contribution_cents).toBe(250 + 170);
    expect(t.transaction.applied.map((i) => i.sku)).toEqual(["sku-desodorante", "sku-pasta"]);
    expect(t.stock["sku-desodorante"]).toBe(8);
  });
  it("si ningún producto de la promoción está en la factura, la compra sigue a precio normal", async () => {
    const r = await rec("c-luis"); // B por afinidad, pero la factura solo tiene crema
    await ev(r.recommendation_id, "presented");
    const t = await buy(r.recommendation_id, "c-luis");
    expect(t.promotion_applied).toBe(false);
    expect(t.reason).toMatch(/Ningún producto de la promoción/);
    expect(t.transaction.total_cents).toBe(1200);
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
    const basket = [{ sku: "sku-champu", quantity: 1 }];
    const r = await rec("c-luis", basket); // B
    await ev(r.recommendation_id, "presented");
    await soldOut(B_SKUS);
    const t = await buy(r.recommendation_id, "c-luis", basket);
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

describe("cédula y escenarios de ejemplo", () => {
  it("lookupCustomer encuentra las cédulas ficticias y rechaza las desconocidas", async () => {
    expect((await api.lookupCustomer("090-000-0001")).id).toBe("c-rosa");
    expect((await api.lookupCustomer("0900000003")).required_family).toBe("membresia");
    await expect(api.lookupCustomer("1234567890")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("sin presentaciones, el veredicto de la campaña es «sin observaciones»", async () => {
    expect((await api.getResults()).overall.status).toBe("sin_observaciones");
  });
  it("con pocas presentaciones, el veredicto es «en observación»", async () => {
    const r = await rec("c-rosa");
    await ev(r.recommendation_id, "presented");
    expect((await api.getResults()).overall.status).toBe("en_observacion");
  });
  it("escenario «funciona»: la campaña se marca como funcionando", async () => {
    await api.seedScenario("funciona");
    const res = await api.getResults();
    expect(res.overall.status).toBe("funciona");
    expect(res.overall.message).toMatch(/está funcionando/);
    expect(res.rows.every((r) => r.verdict.status === "funciona")).toBe(true);
  });
  it("escenario «falla»: la campaña se marca como fallida y sugiere otra estrategia", async () => {
    await api.seedScenario("falla");
    const res = await api.getResults();
    expect(res.overall.status).toBe("falla");
    expect(res.overall.message).toMatch(/falló/);
    expect(res.overall.message).toMatch(/otra estrategia/);
  });
});
