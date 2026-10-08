import { createApi } from "./client";

export * from "./types";
export { createApi, type Api, type ApiOptions } from "./client";
export { createMemoryStorage, type StorageLike } from "./storage";
// Utilidades de presentación sin lógica de negocio, expuestas para que la UI use solo `@/api`.
export { formatCents, formatRatio, OBJECTIVE_LABELS, WEIGHTS, MIN_PRESENTATIONS } from "@/engine";
export { FAMILY_LABELS } from "@/data/seed";

/** Instancia de la aplicación: localStorage con retardo simulado de 200–400 ms. */
export const api = createApi();
