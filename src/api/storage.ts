export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

/**
 * localStorage si está disponible; si no (SSR, modo privado, bloqueado), memoria.
 * `persistent` permite avisar en la UI que los datos se pierden al recargar.
 */
export function createBrowserStorage(): { storage: StorageLike; persistent: boolean } {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const probe = "__farmapos_probe__";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return { storage: window.localStorage, persistent: true };
    }
  } catch {
    // cae a memoria
  }
  return { storage: createMemoryStorage(), persistent: false };
}
