import type { Objective } from "./types";

/** Pesos en porcentaje [afinidad, pertinencia, prioridad]. Supuestos configurables, no políticas observadas. */
export const WEIGHTS: Record<Objective, readonly [number, number, number]> = {
  ganar_participacion: [50, 30, 20],
  consolidar_liderazgo: [30, 40, 30],
};

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  ganar_participacion: "Ganar participación",
  consolidar_liderazgo: "Consolidar liderazgo",
};

export const toPct = (ratio: number) => Math.round(ratio * 100);

/**
 * score = 100 * (wA*afinidad + wP*pertinencia + wR*prioridad), en aritmética entera
 * (señales y pesos en %) y redondeo half-up, para evitar errores de punto flotante.
 */
export function computeScore(
  objective: Objective,
  affinityPct: number,
  relevancePct: number,
  priorityPct: number,
): number {
  const [wA, wP, wR] = WEIGHTS[objective];
  const sum = wA * affinityPct + wP * relevancePct + wR * priorityPct;
  return Math.floor((sum + 50) / 100);
}
