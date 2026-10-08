import { describe, expect, it } from "vitest";

import {
  CAMPAIGN,
  CUSTOMERS,
  EXISTING_RECOMMENDATIONS,
  FLOOR_CENTS,
  INITIAL_STOCK,
  PRODUCTS,
  PROMOTIONS,
  SEGMENTS,
} from "@/data/seed";
import { decide, revalidate } from "./decide";
import type { BasketLine, Campaign, EngineInput, Objective, Promotion } from "./types";

const NOW = "2026-10-08T12:00:00.000Z";
const CREMA: BasketLine[] = [{ sku: "sku-crema", quantity: 1 }];
const stock = () => Object.fromEntries(PRODUCTS.map((p) => [p.sku, INITIAL_STOCK]));

function input(
  customerId: string,
  opts: {
    objective?: Objective;
    basket?: BasketLine[];
    stock?: Record<string, number>;
    promotions?: Promotion[];
    campaign?: Partial<Campaign>;
    floor?: number;
    extraSkus?: string[];
  } = {},
): EngineInput {
  const customer = CUSTOMERS.find((c) => c.id === customerId)!;
  const rec = EXISTING_RECOMMENDATIONS.find((r) => r.customer_id === customerId)!;
  return {
    customer,
    basket: opts.basket ?? CREMA,
    campaign: {
      ...CAMPAIGN,
      objective: opts.objective ?? "ganar_participacion",
      ...opts.campaign,
    },
    segments: SEGMENTS,
    products: PRODUCTS,
    promotions: opts.promotions ?? PROMOTIONS,
    recommended_skus: [...rec.skus, ...(opts.extraSkus ?? [])],
    stock: opts.stock ?? stock(),
    floor_cents: opts.floor ?? FLOOR_CENTS,
    now: NOW,
  };
}

const scores = (i: EngineInput) =>
  Object.fromEntries(decide(i).ranking.map((r) => [r.label, r.score]));

describe("score: casos de verificación de la sección 4 (canasta inicial: 1 crema)", () => {
  it("ganar participación: Rosa A=86 B=41", () => {
    expect(scores(input("c-rosa"))).toEqual({ A: 86, B: 41 });
    expect(decide(input("c-rosa")).winner?.label).toBe("A");
  });
  it("ganar participación: Luis A=56 B=71", () => {
    expect(scores(input("c-luis"))).toEqual({ A: 56, B: 71 });
    expect(decide(input("c-luis")).winner?.label).toBe("B");
  });
  it("consolidar liderazgo: Rosa A=88 B=50", () => {
    expect(scores(input("c-rosa", { objective: "consolidar_liderazgo" }))).toEqual({
      A: 88,
      B: 50,
    });
  });
  it("consolidar liderazgo: Luis A=70 B=68", () => {
    const i = input("c-luis", { objective: "consolidar_liderazgo" });
    expect(scores(i)).toEqual({ A: 70, B: 68 });
    expect(decide(i).winner?.label).toBe("A");
  });
  it("C excluida por membresía para Rosa y Luis (con jabón en canasta y en sus recomendaciones)", () => {
    const basket = [...CREMA, { sku: "sku-jabon", quantity: 1 }];
    for (const id of ["c-rosa", "c-luis"]) {
      const d = decide(input(id, { basket, extraSkus: ["sku-jabon"] }));
      expect(d.ranking.map((r) => r.label)).not.toContain("C");
      expect(d.discarded).toEqual([
        expect.objectContaining({ label: "C", code: "membership_required" }),
      ]);
    }
  });
  it("Ana con jabón en canasta: C=42 gana; A=31 y B=31; afinidad desconocida", () => {
    // La canasta contiene solo jabón: A y B quedan con pertinencia 0,5 (categoría permitida).
    const basket = [{ sku: "sku-jabon", quantity: 1 }];
    const d = decide(input("c-ana", { basket }));
    expect(scores(input("c-ana", { basket }))).toEqual({ A: 31, B: 31, C: 42 });
    expect(d.winner?.label).toBe("C");
    // A y B empatan en score: gana B por mayor contribución (300 > 200).
    expect(d.ranking.map((r) => r.label)).toEqual(["C", "B", "A"]);
    expect(d.winner?.reasons.join(" ")).toMatch(/[Aa]finidad desconocida|sin segmento/);
    expect(d.ranking[1]?.reasons[0]).toMatch(/Afinidad desconocida/);
  });
});

describe("filtros duros", () => {
  it("B sin stock se descarta con motivo y Luis cae a A", () => {
    const bSkus = PROMOTIONS.find((p) => p.id === "promo-B")!.items.map((i) => i.sku);
    const noB = { ...stock(), ...Object.fromEntries(bSkus.map((sku) => [sku, 0])) };
    const d = decide(input("c-luis", { stock: noB }));
    expect(d.discarded).toEqual([expect.objectContaining({ label: "B", code: "out_of_stock" })]);
    expect(d.winner?.label).toBe("A");
  });
  it("promoción vencida no se aplica", () => {
    const promos = PROMOTIONS.map((p) =>
      p.id === "promo-A" ? { ...p, status: "expired" as const } : p,
    );
    const d = decide(input("c-rosa", { promotions: promos }));
    expect(d.discarded[0]).toMatchObject({ label: "A", code: "promotion_expired" });
    expect(d.winner?.label).toBe("B");
  });
  it("promoción fuera de vigencia por fecha no se aplica", () => {
    const promos = PROMOTIONS.map((p) =>
      p.id === "promo-A" ? { ...p, valid_until: "2026-10-01" } : p,
    );
    expect(decide(input("c-rosa", { promotions: promos })).discarded[0]?.code).toBe(
      "promotion_expired",
    );
  });
  it("promoción no aprobada no se aplica", () => {
    const promos = PROMOTIONS.map((p) =>
      p.id === "promo-B" ? { ...p, status: "not_approved" as const } : p,
    );
    expect(decide(input("c-luis", { promotions: promos })).discarded[0]).toMatchObject({
      label: "B",
      code: "promotion_not_approved",
    });
  });
  it("campaña no aprobada o vencida: no_offer con motivo", () => {
    const a = decide(input("c-rosa", { campaign: { status: "not_approved" } }));
    expect(a.decision).toBe("no_offer");
    expect(a.discarded.every((x) => x.code === "campaign_not_approved")).toBe(true);
    expect(a.no_offer_reason).toBeTruthy();
    const b = decide(input("c-rosa", { campaign: { valid_until: "2026-01-01" } }));
    expect(b.discarded.every((x) => x.code === "campaign_expired")).toBe(true);
  });
  it("piso económico bloquea la oferta pese a la afinidad", () => {
    // Con piso 260, ningún producto de A (máx. 250) alcanza el piso aunque Rosa tenga la mayor
    // afinidad; B tiene el champú (300) y pasa.
    const d = decide(input("c-rosa", { floor: 260 }));
    expect(d.discarded).toEqual([expect.objectContaining({ label: "A", code: "below_floor" })]);
    expect(d.winner?.label).toBe("B");
  });
  it("sin candidato válido: no_offer con motivo", () => {
    const d = decide(input("c-rosa", { floor: 1000 }));
    expect(d.decision).toBe("no_offer");
    expect(d.winner).toBeNull();
    expect(d.no_offer_reason).toMatch(/descartadas/);
    expect(d.message).toBeNull();
  });
  it("devuelve score_type configured_rules y versión de reglas", () => {
    const d = decide(input("c-rosa"));
    expect(d.score_type).toBe("configured_rules");
    expect(d.rules_version).toBe("v1");
    const crema = d.winner?.items.find((i) => i.sku === "sku-crema");
    expect(crema).toMatchObject({
      price_before_cents: 1200,
      price_after_cents: 1000,
      contribution_cents: 200,
      in_basket: true,
    });
    expect(d.winner?.items).toHaveLength(4);
  });
  it("la promoción cubre varios productos y solo se aplica a los que pasan stock y piso", () => {
    // Sin stock de crema y con piso 250: de A solo queda la loción (contribución 250).
    const d = decide(input("c-rosa", { floor: 250, stock: { ...stock(), "sku-crema": 0 } }));
    const a = d.ranking.find((r) => r.label === "A");
    expect(a?.items.map((i) => i.sku)).toEqual(["sku-locion"]);
  });
});

describe("desempate y revalidación", () => {
  it("empate de score: mayor contribución, luego menor ID", () => {
    // Prioridad de A=B=0, sin segmento: ambas pertinentes igual y score igual; B (300) > A (200).
    const campaign: Partial<Campaign> = {
      items: CAMPAIGN.items.map((i) => ({ ...i, segment_id: null, priority: 0.5 })),
    };
    const d = decide(input("c-rosa", { campaign, basket: [] }));
    expect(d.ranking[0]?.score).toBe(d.ranking[1]?.score);
    expect(d.ranking.map((r) => r.label)).toEqual(["B", "A"]);
    // Misma contribución: gana el menor ID.
    const promos = PROMOTIONS.map((p) =>
      p.id === "promo-A"
        ? {
            ...p,
            items: p.items.map((i) =>
              i.sku === "sku-crema" ? { ...i, promo_price_cents: 1100 } : i,
            ),
          }
        : p,
    );
    const tie = decide(input("c-rosa", { campaign, basket: [], promotions: promos }));
    expect(tie.ranking[0]?.contribution_cents).toBe(tie.ranking[1]?.contribution_cents);
    expect(tie.ranking.map((r) => r.promotion_id)).toEqual(["promo-A", "promo-B"]);
  });
  it("revalidate detecta stock agotado y vencimiento después de recomendar", () => {
    expect(revalidate(input("c-rosa"), "promo-A")).toBeNull();
    expect(
      revalidate(input("c-rosa", { stock: { ...stock(), "sku-crema": 0 } }), "promo-A"),
    ).toBeNull(); // la promoción sigue vigente en sus otros productos
    const aSkus = PROMOTIONS.find((p) => p.id === "promo-A")!.items.map((i) => i.sku);
    const noA = { ...stock(), ...Object.fromEntries(aSkus.map((sku) => [sku, 0])) };
    expect(revalidate(input("c-rosa", { stock: noA }), "promo-A")?.code).toBe("out_of_stock");
  });
  it("cambiar prioridad cambia la acción por una razón observable", () => {
    const campaign: Partial<Campaign> = {
      items: CAMPAIGN.items.map((i) => (i.promotion_id === "promo-B" ? { ...i, priority: 1 } : i)),
    };
    // Luis: B ya ganaba (71 -> 75); Rosa sigue en A (86) con B a 45.
    expect(scores(input("c-luis", { campaign }))).toEqual({ A: 56, B: 75 });
    expect(scores(input("c-rosa", { campaign }))).toEqual({ A: 86, B: 45 });
  });
});
