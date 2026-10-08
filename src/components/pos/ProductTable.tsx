import { PackageSearch, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { FAMILY_LABELS, formatCents, type DemoData } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PosDemoState } from "./usePosDemo";
import { Panel } from "./Panel";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Inventario con búsqueda (patrón de la pantalla «Inventory» del POS de referencia). */
export function ProductTable({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  const [query, setQuery] = useState("");
  const required = pos.customer?.required_family;
  const rows = useMemo(() => {
    const q = norm(query.trim());
    return data.products
      .map((p, i) => ({ p, n: i + 1 }))
      .filter(
        ({ p }) =>
          !q || [p.name, p.brand, FAMILY_LABELS[p.family]].some((t) => norm(t).includes(q)),
      );
  }, [data.products, query]);
  const locked = pos.completed !== null;

  return (
    <Panel
      title="Productos"
      icon={PackageSearch}
      action={
        required && (
          <Badge className="bg-lime text-lime-foreground hover:bg-lime">
            Caso {FAMILY_LABELS[required]}
          </Badge>
        )
      }
    >
      <div className="relative mb-3">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          aria-label="Buscar producto"
          placeholder="Buscar por nombre, marca o familia…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 pl-9"
        />
      </div>

      <div
        className="hidden grid-cols-[2rem_minmax(0,1fr)_5.5rem_6rem_4rem_5.5rem] gap-2 px-2 pb-1 text-xs font-bold text-muted-foreground sm:grid"
        aria-hidden="true"
      >
        <span>N°</span>
        <span>Producto</span>
        <span>Familia</span>
        <span className="text-right">Precio</span>
        <span className="text-right">Stock</span>
        <span />
      </div>
      <ul className="grid gap-1.5">
        {rows.map(({ p, n }) => {
          const stock = data.stock[p.sku] ?? 0;
          const highlight = required === p.family;
          return (
            <li
              key={p.sku}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-xl border p-2 sm:grid-cols-[2rem_minmax(0,1fr)_5.5rem_6rem_4rem_5.5rem]",
                highlight ? "border-lime bg-accent/60" : "border-border",
              )}
            >
              <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
                {n}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{p.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.brand} ·{" "}
                  <span className="sm:hidden">
                    {FAMILY_LABELS[p.family]} · {formatCents(p.price_cents)} · stock {stock}
                  </span>
                </span>
              </span>
              <span className="hidden sm:block">
                <Badge variant={highlight ? "default" : "secondary"}>
                  {FAMILY_LABELS[p.family]}
                </Badge>
              </span>
              <span className="hidden text-right text-sm tabular-nums sm:block">
                {formatCents(p.price_cents)}
              </span>
              <span
                className={cn(
                  "hidden text-right text-sm tabular-nums sm:block",
                  stock === 0 && "font-bold text-destructive",
                )}
              >
                {stock === 0 ? "Agotado" : stock}
              </span>
              <Button
                size="sm"
                className="h-9 justify-self-end"
                disabled={pos.busy || locked || stock === 0}
                aria-label={`Agregar ${p.name}`}
                onClick={() =>
                  pos.setQuantity(
                    p.sku,
                    (pos.basket.find((l) => l.sku === p.sku)?.quantity ?? 0) + 1,
                  )
                }
              >
                <Plus /> Agregar
              </Button>
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="p-3 text-sm text-muted-foreground">Ningún producto coincide.</li>
        )}
      </ul>
    </Panel>
  );
}
