export const formatCents = (cents: number) => `US$${(cents / 100).toFixed(2).replace(".", ",")}`;

/** 80 -> "0,8"; 85 -> "0,85". */
export const formatRatio = (pct: number) =>
  (pct % 10 === 0 ? (pct / 100).toFixed(1) : (pct / 100).toFixed(2)).replace(".", ",");

export const basketKey = (basket: { sku: string; quantity: number }[]) =>
  basket
    .filter((l) => l.quantity > 0)
    .map((l) => `${l.sku}:${l.quantity}`)
    .sort()
    .join("|");
